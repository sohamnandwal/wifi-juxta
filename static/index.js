const socket = io();

let locationText = document.getElementById("location");
let locateButton = document.getElementById("locateButton");
let messageInput = document.getElementById("messageInput");
let messageButton = document.getElementById("messageButton");
let messages = document.getElementById("messages");

let messageStart = document.getElementById("messageStart");
let messagePresence = document.getElementById("messagePresence");

// Setup Modal Elements
let setupModal = document.getElementById("setupModal");
let setupForm = document.getElementById("setupForm");
let nameInput = document.getElementById("nameInput");
let profilePic = document.getElementById("profilePic");
let profilePreview = document.getElementById("profilePreview");
let locationConsent = document.getElementById("locationConsent");
let setupCloseBtn = document.getElementById("setupCloseBtn");
let settingsBtn = document.getElementById("settingsBtn");

// File Attachment Elements
let fileAttachmentInput = document.getElementById("fileAttachment");
let attachBtn = document.getElementById("attachBtn");
let filePreview = document.getElementById("filePreview");
let fileName = document.getElementById("fileName");
let removeFileBtn = document.getElementById("removeFileBtn");
let uploadLoading = document.getElementById("uploadLoading");

// Current attachment data
let currentAttachment = null;

// User profile data
let userProfile = {
    name: null,
    profilePicture: null,
    locationConsent: false,
    backgroundImage: null,
    backgroundColor: { r: 24, g: 40, b: 40 }
};

locateButton.onclick = () => {
    openMapModal();
}

// Settings button to reopen setup
settingsBtn.onclick = () => {
    setupModal.classList.remove('hidden');
}

// Close button on setup modal
if (setupCloseBtn) {
    setupCloseBtn.onclick = () => {
        setupModal.classList.add('hidden');
    }
}

messageInput.onkeydown = (event) => {
  if (event.key === "Enter") {
    sendMessage();
  }
}
messageButton.onclick = () => {sendMessage();}

// File Attachment Handlers
attachBtn.onclick = () => {
    fileAttachmentInput.click();
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;

fileAttachmentInput.onchange = (event) => {
    const file = event.target.files[0];
    if (file) {
        if (file.size > MAX_FILE_SIZE) {
            alert(`File size exceeds 5MB limit (${(file.size / 1024 / 1024).toFixed(2)}MB). Please choose a smaller file.`);
            fileAttachmentInput.value = '';
            return;
        }

        if (file.type.startsWith('image/')) {
            compressImage(file).then((compressedData) => {
                currentAttachment = {
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    data: compressedData
                };
                showFilePreview(file.name);
            }).catch((error) => {
                console.error('Error compressing file:', error);
                const reader = new FileReader();
                reader.onload = (e) => {
                    currentAttachment = {
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        data: e.target.result
                    };
                    showFilePreview(file.name);
                };
                reader.readAsDataURL(file);
            });
        } else {
            const reader = new FileReader();
            reader.onload = (e) => {
                currentAttachment = {
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    data: e.target.result
                };
                showFilePreview(file.name);
            };
            reader.readAsDataURL(file);
        }
    }
};

removeFileBtn.onclick = () => {
    currentAttachment = null;
    filePreview.classList.add('hidden');
    fileAttachmentInput.value = '';
};

function showFilePreview(name) {
    fileName.textContent = name;
    filePreview.classList.remove('hidden');
}

let longitude;
let latitude;

let options = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0,
  };

function initializeSetup() {
    let savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
        userProfile = JSON.parse(savedProfile);
        setupModal.classList.add('hidden');
        messageInput.removeAttribute("disabled");
        
        // Restore background settings
        applyBackgroundSettings();
    } else {
        setupModal.classList.remove('hidden');
    }
}

profilePic.onchange = (event) => {
    let file = event.target.files[0];
    if (file) {
        compressImage(file).then((compressedData) => {
            userProfile.profilePicture = compressedData;
            profilePreview.style.backgroundImage = `url('${compressedData}')`;
            profilePreview.classList.add('active');
        }).catch((error) => {
            console.error('Error compressing profile picture:', error);
            // Fallback to original
            const reader = new FileReader();
            reader.onload = (e) => {
                userProfile.profilePicture = e.target.result;
                profilePreview.style.backgroundImage = `url('${e.target.result}')`;
                profilePreview.classList.add('active');
            };
            reader.readAsDataURL(file);
        });
    }
};

// ============ BACKGROUND CUSTOMIZATION ============
let backgroundImage = document.getElementById("backgroundImage");
let backgroundPreview = document.getElementById("backgroundPreview");
let redSlider = document.getElementById("redSlider");
let greenSlider = document.getElementById("greenSlider");
let blueSlider = document.getElementById("blueSlider");
let redValue = document.getElementById("redValue");
let greenValue = document.getElementById("greenValue");
let blueValue = document.getElementById("blueValue");
let colorPreview = document.getElementById("colorPreview");
let rgbCode = document.getElementById("rgbCode");

// Background image upload
backgroundImage.onchange = (event) => {
    let file = event.target.files[0];
    if (file) {
        let reader = new FileReader();
        reader.onload = (e) => {
            userProfile.backgroundImage = e.target.result;
            backgroundPreview.style.backgroundImage = `url('${e.target.result}')`;
            backgroundPreview.classList.add('active');
        };
        reader.readAsDataURL(file);
    }
};

// Update RGB color in real-time
function updateRGBColor() {
    const r = parseInt(redSlider.value);
    const g = parseInt(greenSlider.value);
    const b = parseInt(blueSlider.value);
    
    userProfile.backgroundColor = { r, g, b };
    
    redValue.value = r;
    greenValue.value = g;
    blueValue.value = b;
    
    const rgbColor = `rgb(${r}, ${g}, ${b})`;
    colorPreview.style.backgroundColor = rgbColor;
    rgbCode.textContent = rgbColor;
    
    document.body.style.backgroundColor = rgbColor;
}

// RGB Sliders
redSlider.oninput = updateRGBColor;
greenSlider.oninput = updateRGBColor;
blueSlider.oninput = updateRGBColor;

// RGB Value inputs
redValue.oninput = (event) => {
    redSlider.value = Math.max(0, Math.min(255, event.target.value));
    updateRGBColor();
};
greenValue.oninput = (event) => {
    greenSlider.value = Math.max(0, Math.min(255, event.target.value));
    updateRGBColor();
};
blueValue.oninput = (event) => {
    blueSlider.value = Math.max(0, Math.min(255, event.target.value));
    updateRGBColor();
};

// Setup form submission
setupForm.onsubmit = (event) => {
    event.preventDefault();
    
    userProfile.name = nameInput.value.trim();
    userProfile.locationConsent = locationConsent.checked;
    
    if (!userProfile.name) {
        alert('Please enter your name');
        return;
    }
    
    if (!userProfile.locationConsent) {
        alert('Please consent to location sharing to continue');
        return;
    }
    
    try {
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
    } catch (e) {
        if (e.name === 'QuotaExceededError') {
            console.warn('localStorage quota exceeded, clearing old data');
            const profileWithoutPic = { ...userProfile, profilePicture: null };
            try {
                localStorage.setItem('userProfile', JSON.stringify(profileWithoutPic));
            } catch (e2) {
                console.error('Still cannot save profile:', e2);
                alert('Profile storage error. Your profile will not be saved.');
            }
        } else {
            console.error('Error saving profile:', e);
        }
    }
    
    applyBackgroundSettings();
    
    setupModal.classList.add('hidden');
    messageInput.removeAttribute("disabled");
};

function applyBackgroundSettings() {
    if (userProfile.backgroundColor) {
        const { r, g, b } = userProfile.backgroundColor;
        document.body.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
    }
    
    // Apply background image
    if (userProfile.backgroundImage) {
        document.body.style.backgroundImage = `url('${userProfile.backgroundImage}')`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundAttachment = 'fixed';
    }
}

function connect(){
    if("geolocation" in navigator){

        navigator.geolocation.watchPosition(locationSuccess,locationError,options);
    
        socket.off("receive");
        socket.off("nearby");
        
        socket.on("receive", (message) => {
            receiveMessage(message);
        });

        socket.on("nearby", (obj) => {
            count_obj = JSON.parse(obj);
            messagePresence.innerText = "Other users in proximity: "+(count_obj["count"]).toString();
        });
    
    }else{
        locationText.textContent = "Location: unavailable";
    }
}

socket.on("connect", () => {connect();})

// Handle Socket.io errors
socket.on("error", (error) => {
    console.error('Socket error:', error);
});

socket.on("connect_error", (error) => {
    console.error('Connection error:', error);
});

socket.io.on("error", (error) => {
    console.error('IO error:', error);
});

function locationSuccess(position){

    let prev_lat = latitude;

    latitude = position.coords.latitude;
    longitude = position.coords.longitude;

    let me = {
        "id": socket.id,
        "lon": longitude,
        "lat": latitude,
        "name": userProfile.name,
        "profilePicture": userProfile.profilePicture,
    };

    if(prev_lat == undefined){

        let date = new Date();
        messageStart.innerText = "Joined conversation at "+date.toLocaleTimeString();

        socket.emit("join",JSON.stringify(me));
        messageInput.removeAttribute("disabled");
    }else{
        socket.emit("status",JSON.stringify(me));
    }

    
    locationText.textContent = latitude.toString()+"\n"+longitude.toString();
}

function locationError(){
    locationText.textContent = "Location: error";
}

function sendMessage(){

    // Allow sending if there's a message OR an attachment
    if (!messageInput.value.trim() && !currentAttachment) {
        alert('Please enter a message or attach a file');
        return;
    }

    let message = {
        "id":socket.id,
        "lon": longitude,
        "lat": latitude,
        "msg":cleanMessage(messageInput.value),
        "name": userProfile.name,
        "profilePicture": userProfile.profilePicture,
    };

    if (currentAttachment) {
        message.attachment = currentAttachment;
        uploadLoading.classList.remove('hidden');
    }

    try {
        socket.emit("send",JSON.stringify(message));
    } catch (error) {
        console.error('Error sending message:', error);
        uploadLoading.classList.add('hidden');
    }
    
    console.log("hi");
    messageInput.value = "";
    
    if (currentAttachment) {
        setTimeout(() => {
            uploadLoading.classList.add('hidden');
        }, 500);
    }
    
    currentAttachment = null;
    filePreview.classList.add('hidden');
    fileAttachmentInput.value = '';
}

function receiveMessage(message){

    message = JSON.parse(message);

    const attachment = message["attachment"] || null;
    const isSystemMessage = message["isSystemMessage"] || false;
    createMessage(message["from"], message["msg"], message["name"], message["profilePicture"], attachment, isSystemMessage);
}

function cleanMessage(messageText){
    return messageText;
}

function createMessage(id, messageText, senderName, profilePic, attachment = null, isSystemMessage = false){
    let msgElement = document.createElement("div");
    msgElement.classList.add("message");

    if (isSystemMessage) {
        msgElement.classList.add("system-message");
        
        let systemMsgDiv = document.createElement("div");
        systemMsgDiv.classList.add("system-message-content");
        systemMsgDiv.innerHTML = `<i>${messageText}</i>`;
        msgElement.appendChild(systemMsgDiv);
        
        messages.insertBefore(msgElement, messages.lastElementChild);
        msgElement.scrollIntoView({ behavior: "smooth"});
        return;
    }

    if(id === socket.id){
        msgElement.classList.add("self-message");
    }

    let profileSection = document.createElement("div");
    profileSection.classList.add("message-profile");

    if (profilePic) {
        let profileImg = document.createElement("img");
        profileImg.src = profilePic;
        profileImg.classList.add("profile-pic-small");
        profileSection.appendChild(profileImg);
    } else {
        let profilePlaceholder = document.createElement("div");
        profilePlaceholder.classList.add("profile-pic-placeholder");
        profilePlaceholder.textContent = (senderName ? senderName[0].toUpperCase() : "?");
        profileSection.appendChild(profilePlaceholder);
    }

    msgElement.appendChild(profileSection);

    let bubElement = document.createElement("div");
    bubElement.classList.add("bubble");
    bubElement.style.backgroundColor = "#"+(string_to_color(id,20))+"30";

    msgElement.appendChild(bubElement);

    if (senderName) {
        let nameElement = document.createElement("p");
        nameElement.classList.add("message-sender-name");
        nameElement.innerText = senderName;
        bubElement.appendChild(nameElement);
    }

    let msgTextElement = document.createElement("p");
    msgTextElement.classList.add("message-text");
    msgTextElement.innerText = messageText;

    bubElement.appendChild(msgTextElement);

    if (attachment) {
        const attachmentDiv = document.createElement("div");
        attachmentDiv.classList.add("message-attachment");
        
        if (attachment.type.startsWith('image/')) {
            const img = document.createElement("img");
            img.src = attachment.data;
            img.classList.add("attached-image");
            img.alt = attachment.name;
            attachmentDiv.appendChild(img);
        } else {
            const link = document.createElement("a");
            link.href = attachment.data;
            link.download = attachment.name;
            link.classList.add("attachment-link");
            
            const fileIcon = getFileTypeIcon(attachment.type);
            link.innerHTML = `${fileIcon} ${attachment.name}`;
            
            attachmentDiv.appendChild(link);
        }
        
        bubElement.appendChild(attachmentDiv);
    }

    let msgTimeElement = document.createElement("p");
    msgTimeElement.classList.add("message-time");
    let date = new Date();
    msgTimeElement.innerText = date.toLocaleTimeString();

    bubElement.appendChild(msgTimeElement);

    messages.insertBefore(msgElement,messages.lastElementChild);

    msgElement.scrollIntoView({ behavior: "smooth"});
}

function getFileTypeIcon(mimeType) {
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    if (mimeType.includes('text')) return '📋';
    if (mimeType.includes('sheet')) return '📊';
    return '📎';
}

// from https://github.com/brandoncorbin/string_to_color
function string_to_color(a,b){"use strict";var b="number"==typeof b?b:-10,c=function(a){for(var b=0,c=0;c<a.length;c++)b=a.charCodeAt(c)+((b<<5)-b);return b},d=function(a,b){var c=parseInt(a,16),d=Math.round(2.55*b),e=(c>>16)+d,f=(255&c>>8)+d,g=(255&c)+d;return(16777216+65536*(255>e?1>e?0:e:255)+256*(255>f?1>f?0:f:255)+(255>g?1>g?0:g:255)).toString(16).slice(1)},e=function(a){var b=(255&a>>24).toString(16)+(255&a>>16).toString(16)+(255&a>>8).toString(16)+(255&a).toString(16);return b};return d(e(c(a)),b)}

// ============ MAP FUNCTIONALITY ============
let mapModal = document.getElementById("mapModal");
let closeMapBtn = document.getElementById("closeMapBtn");
let map = null;
let markers = {};
let allNearbyUsers = {};
let mapUpdateInterval = null;

function createCustomIcon(profilePicture, userName) {
    let html = '<div class="profile-marker">';
    if (profilePicture) {
        html += `<img src="${profilePicture}" alt="${userName}">`;
    } else {
        html += `<div class="profile-marker-placeholder">${(userName ? userName[0].toUpperCase() : "?")}</div>`;
    }
    html += '</div>';

    return L.divIcon({
        html: html,
        className: 'custom-profile-marker',
        iconSize: [50, 50],
        iconAnchor: [25, 25],
        popupAnchor: [0, -25]
    });
}

function openMapModal() {
    if (!mapModal) return;
    
    mapModal.classList.remove('hidden');
    
    if (!map) {
        setTimeout(() => {
            initializeMap();
        }, 100);
    } else {
        map.invalidateSize();
        updateMapMarkers();
    }
}

// Close map modal
closeMapBtn.onclick = () => {
    if (mapModal) {
        mapModal.classList.add('hidden');
    }
};

// Close map when clicking outside modal
mapModal.onclick = (event) => {
    if (event.target === mapModal) {
        mapModal.classList.add('hidden');
    }
};

// Initialize Leaflet map
function initializeMap() {
    if (map) return;
    
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    // Default to user's location or world view
    const initialLat = latitude || 0;
    const initialLon = longitude || 0;
    const initialZoom = latitude ? 15 : 2;

    map = L.map('map').setView([initialLat, initialLon], initialZoom);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);

    if (latitude && longitude) {
        const userMarker = L.marker([latitude, longitude], {
            icon: createCustomIcon(userProfile.profilePicture, userProfile.name),
            title: userProfile.name + ' (You)'
        }).addTo(map);

        userMarker.bindPopup(`
            <div class="marker-popup">
                ${userProfile.profilePicture ? `<img src="${userProfile.profilePicture}" alt="${userProfile.name}">` : ''}
                <div class="marker-popup-name">${userProfile.name} (You)</div>
                <div class="marker-popup-coords">Lat: ${latitude.toFixed(4)}<br>Lon: ${longitude.toFixed(4)}</div>
            </div>
        `);
        
        markers[socket.id] = userMarker;
    }

    socket.emit('get_nearby_users', JSON.stringify({
        id: socket.id,
        lat: latitude,
        lon: longitude
    }));

    if (mapUpdateInterval) clearInterval(mapUpdateInterval);
    mapUpdateInterval = setInterval(updateMapMarkers, 7000);
}

function updateMapMarkers() {
    if (!map) return;

    socket.emit('get_nearby_users', JSON.stringify({
        id: socket.id,
        lat: latitude,
        lon: longitude
    }));
}

// Handle receiving nearby users data
socket.on('nearby_users_list', (data) => {
    try {
        const users = JSON.parse(data);
        allNearbyUsers = users;

        if (!map) return;

        for (const userId in users) {
            const user = users[userId];

            if (userId === socket.id) continue; 

            if (markers[userId]) {
                const oldMarker = markers[userId];
                map.removeLayer(oldMarker);
            }

            if (user.lat !== undefined && user.lon !== undefined) {
                const marker = L.marker([user.lat, user.lon], {
                    icon: createCustomIcon(user.profilePicture, user.name),
                    title: user.name
                }).addTo(map);

                marker.bindPopup(`
                    <div class="marker-popup">
                        ${user.profilePicture ? `<img src="${user.profilePicture}" alt="${user.name}">` : ''}
                        <div class="marker-popup-name">${user.name}</div>
                        <div class="marker-popup-coords">Lat: ${user.lat.toFixed(4)}<br>Lon: ${user.lon.toFixed(4)}</div>
                    </div>
                `);

                markers[userId] = marker;
            }
        }

        for (const markerId in markers) {
            if (markerId !== socket.id && !users[markerId]) {
                if (markers[markerId]) {
                    map.removeLayer(markers[markerId]);
                    delete markers[markerId];
                }
            }
        }
    } catch (e) {
        console.error('Error updating markers:', e);
    }
});

// ============ IMAGE COMPRESSION UTILITY ============
// Compress image using Canvas API - reduces file size significantly
// skipCompression: if true, returns original data URL (used for wallpaper)
function compressImage(file, skipCompression = false) {
    return new Promise((resolve, reject) => {
        if (skipCompression || !file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                let width = img.width;
                let height = img.height;
                const MAX_WIDTH = 1024;
                const MAX_HEIGHT = 1024;
                
                if (width > MAX_WIDTH || height > MAX_HEIGHT) {
                    const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
                    width = Math.round(width * ratio);
                    height = Math.round(height * ratio);
                }
                
                canvas.width = width;
                canvas.height = height;
                
                ctx.drawImage(img, 0, 0, width, height);

                try {
                    let quality = 0.6;
                    let compressedData = canvas.toDataURL('image/jpeg', quality);
                    
                    while (compressedData.length > 500000 && quality > 0.3) {
                        quality -= 0.1;
                        compressedData = canvas.toDataURL('image/jpeg', quality);
                    }
                    
                    resolve(compressedData);
                } catch (error) {
                    reject(error);
                }
            };
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

window.addEventListener('load', () => {
    initializeSetup();
});
