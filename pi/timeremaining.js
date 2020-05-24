let websocket = null,
    uuid = null,
    actionInfo = {},

    address = null,
    interval;

function connectElgatoStreamDeckSocket(inPort, inPropertyInspectorUUID, inRegisterEvent, inInfo, inActionInfo) {
    uuid = inPropertyInspectorUUID;
    actionInfo = JSON.parse(inActionInfo);

    function registerPlugin(inPropertyInspectorUUID) {
        const json = {
            "event": inRegisterEvent,
            "uuid": inPropertyInspectorUUID
        };
        websocket.send(JSON.stringify(json));
    };

    websocket = new WebSocket('ws://localhost:' + inPort);

    websocket.onopen = function() {
        // WebSocket is connected, register the Property Inspector
        registerPlugin(inPropertyInspectorUUID);

        // WebSocket is connected, get the global settings
        let json = {
            "event": "getGlobalSettings",
            "context": uuid,
        };
        websocket.send(JSON.stringify(json));
    };

    websocket.onmessage = function (evt) {
        // Received message from Stream Deck
        const jsonObj = JSON.parse(evt.data);

        if (jsonObj.event === 'didReceiveGlobalSettings') {
            const payload = jsonObj.payload.settings;
            const e = document.getElementById('poll-interval');


            address = payload.address;
            interval = payload.interval;


            document.getElementById('address').value = payload.address;
            document.getElementById('poll-interval').value = payload.interval;



            if(document.getElementById('address').value === "undefined") document.getElementById('address').value = "";
            if(e.value === "undefined") document.getElementById('poll-interval').value = "60";

            const el = document.querySelector('.sdpi-wrapper');
            el && el.classList.remove('hidden');
        }
    };
}

function updateGlobalData() {
    if (websocket && (websocket.readyState === 1)) {
        let payload = {};
        const e = document.getElementById('poll-interval');

        payload.address = document.getElementById('address').value;
        payload.interval = e.options[e.selectedIndex].value;

        console.log(payload)

        const json = {
            "event": "setGlobalSettings",
            "context": uuid,
            "payload": payload
        };
        websocket.send(JSON.stringify(json));
    }
}

function testConnection() {
    
    const address = document.getElementById('address').value;
    fetch(`${address}/api/version`)


        .then(response => {
            let json = {};
            if(response.status !== 200) {
                json = {
                    "event": "logMessage",
                    "payload": {
                        "message": `Test Connection Failed. Status code ${response.status}`
                    }
                };
                document.getElementById('testConnection').innerText = `Failed!`;
            }
            json = {
                "event": "logMessage",
                "payload": {
                    "message": `Test Connection Successful!`
                }
            };
            document.getElementById('testConnection').innerText = `Success!`;
            if (websocket && (websocket.readyState === 1)) return websocket.send(JSON.stringify(json));
        })
        .catch(err => {
            const json = {
                "event": "logMessage",
                "payload": {
                    "message": `Test Connection Failed: ${err}`
                }
            };
            document.getElementById('testConnection').innerText = `Failed!`;
            if (websocket && (websocket.readyState === 1)) return websocket.send(JSON.stringify(json));
        })
}

async function openPage() {
    if (websocket && (websocket.readyState === 1)) {
        const json = {
                    'event': 'openUrl',
                    'payload': {
                        'url': document.getElementById('address').value
                    }
                };
        websocket.send(JSON.stringify(json));
    }
}



