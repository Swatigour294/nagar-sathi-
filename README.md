# Nagar Sathi - NMC civic complaint portal

A self-contained full-stack demonstration for a Nagpur Municipal Corporation grievance platform. It has citizen and officer roles, sign-up/sign-in screens, ten official NMC zones, evidence-ready complaint intake, tracking, SOS, notices, an explainable AI priority queue, and zone insights.

## Open and edit in VS Code

1. Extract the ZIP file.
2. Open the `nagpur-nagar-sathi` folder in VS Code.
3. Open the integrated terminal and run `npm start`.
4. Visit `http://localhost:4173` in your browser.

You can edit `public/app.js` for the website behaviour, `public/style.css` and the small feature CSS files for appearance, and `server.js` for the local API and initial data. No `npm install` is required because this prototype uses only Node.js built-in modules.

## Run locally

From this folder, run:

```powershell
node server.js
```

Then open `http://localhost:4173`.

Data is stored locally in `data.json`, created automatically after the first registration or complaint submission. Delete that file to reset the demo.

## Location and evidence integrity

Citizens can choose **Use my current location** to attach GPS coordinates to a report, in addition to the written address. Uploaded photo/video evidence receives an on-screen **AI evidence integrity check**, which follows the complaint to the officer detail page.

The integrity check is intentionally a transparent prototype: it uses available file metadata and flags unusual filenames or very small files for human review. It cannot prove that a file is genuine or conclusively identify AI-generated imagery. Production deployment needs a trained image-forensics service, secure original-media uploads with EXIF preservation, provenance standards such as C2PA, adversarial testing, and a human review path.

## Officer zone intelligence

The officer workspace now includes an active-complaints bar graph, an interactive Nagpur map, and zone workload cards. Map-marker size reflects the active report count; red markers identify zones with critical reports. Selecting a marker, graph bar, or zone card opens the priority queue filtered to that zone.

## Orange City identity

The supplied Nagpur Orange City image is included as the first-load welcome popup and as the home-page visual background. It is stored locally at `public/assets/nagpur-orange-city.png`.

## Latest officer features

- The Orange City image now animates from the welcome screen to the upper-left website icon when the officer or citizen enters the portal.
- Selecting a zone bar or zone card opens a detailed zone graph for issue-category and severity breakdowns.
- The officer **IoT camera monitor** includes simulated device feeds, gateway status, and an integration plan for approved municipal RTSP-to-WebRTC/HLS camera infrastructure. Real camera access is intentionally not included without NMC-approved devices, network gateways, permissions, and security controls.

## Important implementation note

This is a functional prototype, not a production deployment. The AI priority explanation is a transparent rules-based demo; production use should add identity verification, authentication/authorization, malware scanning, secure media storage, audit logging, geocoding, consent/retention controls, and an independently validated ML model with human review.
