from flask import Flask, render_template, request
from flask_socketio import SocketIO
from markupsafe import escape
import json
import math
from octree import node, octree, quadtree, balltree

UPDATE_RANGE = 3
RANGE = 3500        #maximum distance for communication in meters
ER = 6366707.0195 #Earth Radius in Meters
MAX_USERS = 5000       # Maximum concurrent users

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, cors_allowed_origins="*")

clients = {}

# tree = octree(0, 0, 0, ER*1.1)
tree = balltree()

USETREE = True

# https://en.wikipedia.org/wiki/Haversine_formula
def haversine(p1, p2):
    lat1, lon1, lat2, lon2 = map(math.radians, [p1[0], p1[1], p2[0], p2[1]])
    a = math.sin((lat2 - lat1)/2)**2
    b = math.cos(lat1)
    c = math.cos(lat2)
    d = math.sin((lon2 - lon1)/2)**2
    return 2*ER*math.asin(math.sqrt(a+(b*c*d)))

def find_targets(id):
    n = clients[id]
    targets = []
    if USETREE:
        o = tree.find(n, RANGE)
        s = {}
        for t in o:
            if t.id is not None:
                s[t.id] = t
                # print(f'found {t.id}')
        for i, p in s.items():
            targets.append(i)
        # print(f'found {len(targets)} nearby {n.get_coord()} {n.id}')
    else:
        for i, o in clients.items():
            dist = haversine(n.get_coord(), o.get_coord())
            # print (f"people are {dist}m apart")
            if  dist < RANGE:
                targets.append(i)
    return targets

@app.route('/')
def home():
    return render_template('index.html')

@socketio.on('connect')
def test_connect(auth):
    print("Client connected")

@socketio.on('disconnect')
def test_disconnect():
    if request.sid in clients:
        clients[request.sid].remove()
        del clients[request.sid]


@socketio.on('join')
def join(content):
    data = json.loads(content)
    if data['id'] not in clients:
        clients[data['id']] = node(data['id'], data['lat'], data['lon'])
    
    # Store user profile data
    if 'name' in data:
        clients[data['id']].name = data['name']
    if 'profilePicture' in data:
        clients[data['id']].profilePicture = data['profilePicture']
    if 'locationConsent' in data:
        clients[data['id']].locationConsent = data['locationConsent']
    
    if USETREE:
        # clients[data['id']].remove()
        tree.insert(clients[data['id']])
    
    # Send join notification to nearby users
    user_name = data.get('name', 'Someone')
    targets = find_targets(data['id'])
    for target_id in targets:
        if target_id != data['id']:  # Don't send to self
            notification = {
                'from': 'SYSTEM',
                'msg': f'{user_name} is ready to Juxt.',
                'name': 'System',
                'isSystemMessage': True
            }
            socketio.emit('receive', json.dumps(notification), to=target_id)

@socketio.on('send')
def message(content):
    data = json.loads(content)
    if 'id' not in data:
        data['id'] = request.sid
    if data['id'] not in clients:
        clients[data['id']] = node(data['id'], data['lat'], data['lon'])
        if USETREE:
            tree.insert(clients[data['id']])
    else:
        if haversine((clients[data['id']].lat, clients[data['id']].lon), 
                     (data['lat'], data['lon'])) > UPDATE_RANGE:
            clients[data['id']].update_location(data['lat'], data['lon'])
            if USETREE:
                #tree.build_tree(tree.points)
                clients[data['id']].remove()
                tree.insert(clients[data['id']])
    
    # Store user profile data
    if 'name' in data:
        clients[data['id']].name = data['name']
    if 'profilePicture' in data:
        clients[data['id']].profilePicture = data['profilePicture']
    if 'locationConsent' in data:
        clients[data['id']].locationConsent = data['locationConsent']
    
    out = {}
    out['from'] = data['id']
    out['msg'] =  data['msg']
    out['name'] = data.get('name', 'Unknown')
    out['profilePicture'] = data.get('profilePicture', None)
    
    # Include attachment if present
    if 'attachment' in data:
        out['attachment'] = data['attachment']
    
    # Allow empty messages if attachment exists, otherwise require message text
    has_attachment = 'attachment' in data
    if out['msg'] == '' and not has_attachment:
        socketio.emit('bad', 'Cannot Send Empty Message', to=data['id'])
        return
    if len(out['msg']) > 256:
        socketio.emit('bad', 'Cannot Send Message Longer Than 256 Chars', to=data['id'])
        return
    pl = json.dumps(out)
    targets = find_targets(data['id'])
    for t in targets:
        socketio.emit('receive', pl, to=t)

@socketio.on('status')
def update(content):
    data = json.loads(content)
    if 'id' not in data:
        data['id'] = request.sid
    if data['id'] not in clients:
        clients[data['id']] = node(data['id'], data['lat'], data['lon'])
    else:
        if haversine((clients[data['id']].lat, clients[data['id']].lon), 
                     (data['lat'], data['lon'])) > UPDATE_RANGE:
            clients[data['id']].update_location(data['lat'], data['lon'])
            if USETREE:
                #tree.build_tree(tree.points)
                # print("updating value")
                clients[data['id']].remove()
                tree.insert(clients[data['id']])
    socketio.emit('nearby', json.dumps({'count': len(find_targets(data['id']))-1}), to=data['id'])

@socketio.on('get_nearby_users')
def get_nearby_users(content):
    """Send nearby users with their profile info for map display"""
    data = json.loads(content)
    user_id = data.get('id', request.sid)
    
    if user_id not in clients:
        return
    
    nearby_users = {}
    targets = find_targets(user_id)
    
    for target_id in targets:
        if target_id in clients:
            client = clients[target_id]
            nearby_users[target_id] = {
                'lat': client.lat,
                'lon': client.lon,
                'name': getattr(client, 'name', 'Unknown'),
                'profilePicture': getattr(client, 'profilePicture', None)
            }
    
    socketio.emit('nearby_users_list', json.dumps(nearby_users), to=user_id)

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', ssl_context='adhoc')