# Camera App Scaffolding Plan

This Markdown file outlines a staged scaffolding plan you can feed into Cursor to build your cross-platform Expo camera app **JJNROphotos**. It covers automated filename formatting for photos and optional creation of additional files per capture.

---

## Stage 1: Project Initialization

**Goal:** (Folder already created) Initialize the Expo project in your `JJNROphotos` directory and install required dependencies.

**Directory Structure:**

```bash
JJNROphotos/
├─ App.js
├─ package.json
├─ node_modules/
└─ ...
```

**Cursor Tasks:**

```bash
cd JJNROphotos
expo init . --template blank
expo install expo-camera expo-file-system expo-media-library
```

---

## Stage 2: Basic App Scaffolding

**Goal:** Set up a basic `App.js` that requests camera and media-library permissions, showing loading or error messages.

**File:** `App.js`

**Cursor Tasks:**

- Create a functional React component `App`.
- Import hooks (`useState`, `useEffect`) from `react` and modules from `expo-camera`, `expo-file-system`, and `expo-media-library`.
- In `useEffect`, call `Camera.requestPermissionsAsync()` and `MediaLibrary.requestPermissionsAsync()`, storing statuses in state.
- Render placeholders: loading spinner while `null`, error text if denied, or proceed to camera UI.

---

## Stage 3: UI Layout & Initial Configuration

**Goal:** On startup, prompt the user to enter `storeNumber`, `city`, `state`, and `selectedDate` before showing the camera interface.

**File:** `App.js`

**Cursor Tasks:**

- Add configuration state:
  ```js
  const [isConfigured, setIsConfigured] = useState(false);
  const [storeNumber, setStoreNumber] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [photoDescription, setPhotoDescription] = useState('Exterior');
  const [selectedDate, setSelectedDate] = useState(new Date());
  ```
- In the component render, conditionally display either:
  - **Configuration Screen** (when `!isConfigured`):
    - `<TextInput>` for `storeNumber` (numeric keyboard).
    - `<TextInput>` for `city` and one for `state` (default keyboard).
    - `<DateTimePicker>` for `selectedDate`.
    - A **Confirm** `<Button>` that validates inputs and then calls `setIsConfigured(true)`.
  - **Camera Screen** (when `isConfigured`):
    - Render the `<Camera>` component filling most of the screen, with `ref={cameraRef}`.
    - Overlay control bar at bottom with three `<TouchableOpacity>` buttons: **Flip**, **📸**, and **⚡️ On/Off**.
    - Add a dropdown `<Picker>` for `photoDescription` above the camera preview.
- Define styles for both screens (centered form inputs, confirm button, camera layout, and control bar).

---

## Stage 4: Camera Functionality Camera Functionality Camera Functionality

**Goal:** Implement switching between front/back cameras and toggling flash mode.

**File:** `App.js`

**Cursor Tasks:**

- Add state: `cameraType` (back/front) and `flashMode` (on/off).
- Write `toggleType()` to toggle `cameraType` between `Camera.Constants.Type.back` and `.front`.
- Write `toggleFlash()` to toggle `flashMode` between `FlashMode.off` and `.on`.
- Attach these functions to the Flip and Flash buttons.

---

## Stage 5: Photo Capture, Naming & File Creation

**Goal:** Capture photos, apply your naming convention with description suffix logic, allow post-capture edit, and save image + metadata files.

**File:** `App.js`

**Cursor Tasks:**

- Maintain a counter state for each description:
  ```js
  const initialCounts = {
    Exterior: 0, FrontDoor: 0, Kitchen: 0, Lobby: 0, POSKitchen: 0,
    POSLobby: 0, DTPOS: 0, WallStations: 0, BackofHouse: 0,
    Walkin: 0, Freezer: 0, BathroomM: 0, BathroomF: 0
  };
  const [descCounts, setDescCounts] = useState(initialCounts);
  ```
- In `takeAndSave()`, after capturing (`takePictureAsync`):
  1. **Preliminary increment:** Increment the count for the current `photoDescription` and compute a provisional `labeledDesc`:
     ```js
     const count = descCounts[photoDescription] + 1;
     const provisionalCount = count;
     setDescCounts(prev => ({ ...prev, [photoDescription]: count }));
     let labeledDesc;
     if (photoDescription === 'Exterior') {
       labeledDesc = `${photoDescription}${String.fromCharCode(64 + provisionalCount)}`;
     } else {
       labeledDesc = `${photoDescription}${provisionalCount}`;
     }
     ```
  2. **Post-capture edit:** Present a modal or alert with a `<TextInput>` or `<Picker>` pre-filled with `labeledDesc`, allowing the user to adjust it. Wait for confirmation before proceeding.
  3. **Date formatting:** Format `selectedDate` (`Date` object) as `dd/mm/yy`:
     ```js
     const pad = n => String(n).padStart(2,'0');
     const day = pad(selectedDate.getDate());
     const month = pad(selectedDate.getMonth()+1);
     const year = String(selectedDate.getFullYear()).slice(-2);
     const dateStr = `${day}/${month}/${year}`;
     ```
  4. **Filename build:** Use the (possibly edited) `labeledDesc` to build:
     ```js
     const imageName = `${storeNumber}_${labeledDesc}_${dateStr}.jpg`;
     const metaName  = `${storeNumber}_${labeledDesc}_${dateStr}.json`;
     ```
  5. **File operations:**
     - Move the photo from `photo.uri` to `FileSystem.documentDirectory + imageName`.
     - Save to gallery if `hasMediaPerm`:
       ```js
       await MediaLibrary.createAssetAsync(FileSystem.documentDirectory + imageName);
       ```
     - Write metadata JSON:
       ```js
       const metadata = { storeNumber, labeledDesc, date: dateStr, filename: imageName };
       await FileSystem.writeAsStringAsync(
         FileSystem.documentDirectory + metaName,
         JSON.stringify(metadata)
       );
       ```
  6. **Confirmation:** Alert the user:
     ```js
     alert(`Saved: ${imageName}
     ```

Metadata: \${metaName}\`); \`\`\`

- Commit and test behavior for multiple captures in a session.

---

## Stage 6: Folder Structure & Photo Copy

**Goal:** Create store-specific directories (`storeNumber City State`) and a subfolder `Paul Plass`, plus a UI to select existing photos and copy them into that folder.

**File:** `App.js`

**Cursor Tasks:**

- Compute `folderName = `\${storeNumber} \${city} \${state}`;`
- Define `mainDir = FileSystem.documentDirectory + folderName;`
- Define `subDir = mainDir + '/Paul Plass';`
- Use `FileSystem.makeDirectoryAsync(mainDir, { intermediates: true })` and `FileSystem.makeDirectoryAsync(subDir, { intermediates: true })` to create directories.
- Maintain a `photos` state array containing `{ filename, uri }` by calling `FileSystem.readDirectoryAsync(FileSystem.documentDirectory)` and filtering for image files (e.g., `.jpg`).
- Render a `<FlatList>` or list of `photos` with checkboxes/toggles to select multiple items (use `selectedPhotos` state).
- Add a button **Copy Selected To Folder**; on press, iterate `selectedPhotos` and for each `filename`, call:
  ```js
  await FileSystem.copyAsync({
    from: FileSystem.documentDirectory + filename,
    to: subDir + '/' + filename
  });
  ```
- Alert the user when the copy operation completes.

---

## Stage 7: Zipping & OneDrive Upload

**Goal:** Create a zip archive of the store folder (`storeNumber City State`) and upload it to a Teams folder via OneDrive (using Microsoft Graph).

**File:** `App.js` or a new utility module (e.g., `onedrive.js`)

**Cursor Tasks:**

- Compute `folderName` and `mainDir` as in Stage 6.
- **Zip the folder:** Install and use `expo-zip`:
  ```bash
  expo install expo-zip
  ```
  ```js
  import * as Zip from 'expo-zip';

  const zipPath = FileSystem.documentDirectory + `${folderName}.zip`;
  await Zip.createArchiveAsync({
    sourceUri: mainDir,
    archiveUri: zipPath,
  });
  ```
- **Authenticate with Microsoft Graph:**
  - Install AuthSession: `expo install expo-auth-session`
  - Configure Azure AD app and define redirect URI.
  - In code, initiate OAuth flow:
    ```js
    import * as AuthSession from 'expo-auth-session';

    const discovery = AuthSession.Discovery.Microsoft;
    const authRequest = await AuthSession.loadAsync({
      clientId: '<YOUR_CLIENT_ID>',
      scopes: ['Files.ReadWrite.All'],
      redirectUri: AuthSession.makeRedirectUri(),
    }, discovery);
    const authResult = await authRequest.promptAsync(discovery);
    const token = authResult.params.access_token;
    ```
- **Upload zip to Teams folder:**
  ```js
  const teamsFolderPath = 'Teams/YourTeam/Shared Documents/YourFolder';
  const uploadUrl =
    `https://graph.microsoft.com/v1.0/me/drive/root:/${teamsFolderPath}/${folderName}.zip:/content`;
  const base64 = await FileSystem.readAsStringAsync(zipPath, { encoding: FileSystem.EncodingType.Base64 });
  await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/zip',
    },
    body: atob(base64),
  });
  ```
- Handle success/failure with user feedback.

---

## Stage 8: Cursor Integration

**Goal:** Feed these tasks into Cursor, iterating by stage.

**Instructions:**

- For each stage, paste the corresponding Cursor Tasks into Cursor prompts.
- Review and approve generated code before moving on.
- Commit and test after each stage.

---

## Stage 9: Testing & Refinement

**Goal:** Validate on devices, add error handling, and polish UX across all features.

**Cursor Tasks:**

- Test zipping and upload flows, including permission and network failures.
- Wrap zip and upload code in `try/catch`, providing clear error messages.
- Ensure OAuth flow handles token expiration and edge cases.
- Update README with Azure AD app setup and required permissions.
- Verify complete end-to-end on Android and iOS via Expo Go.

---

*End of scaffolding plan for JJNROphotos.*\*

