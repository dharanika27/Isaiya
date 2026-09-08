# ISAIYA — Requirements — V1 Android Regional Music App

## 1. Product Name

**ISAIYA**

Suggested tagline:

**Your music. Your mood.**

ISAIYA is a modern Android music discovery and playback application focused initially on Tamil, Telugu, and Malayalam music.

The name should be used consistently throughout the project:

- App name: ISAIYA
- Package/application identifiers should use a suitable developer-owned namespace, not assume that `com.isaiya` is available.
- Do not use ISAIYA branding that implies affiliation with YouTube or another music service.

---

## 2. Project Overview

Build a modern Android music discovery and playback application focused on Tamil, Telugu, and Malayalam music.

The app should let a user:

1. Open the app.
2. Search for a song, artist, movie, or music-related query.
3. Select a result.
4. Play it using a permitted YouTube playback integration.
5. Automatically continue with relevant songs where the selected playback architecture permits it.
6. Skip songs they do not like.
7. Save favorites and recently played items.
8. Use the app primarily on an Android mobile device.

The application must NOT download, extract, or store YouTube audio/video files.

---

## 3. Product Vision

The core ISAIYA experience is:

**Search → Play → Automatically Continue → Skip if Needed**

The application should be:

- Simple
- Fast
- Mobile-first
- Easy to understand
- Focused on regional Indian music
- Free for the user's basic app experience
- Built around legal/official music playback mechanisms

ISAIYA should not attempt to reproduce every feature of Spotify, YouTube Music, or another large streaming platform in V1.

---

## 4. V1 Goals

The first version should prioritize a small, reliable feature set:

- Android mobile application
- Kotlin
- Jetpack Compose
- Material 3
- YouTube-based music/video discovery
- Permitted YouTube playback integration
- Tamil / Telugu / Malayalam language selection
- Search
- Automatic next-song queue where supported
- Skip / next / previous
- Mini player
- Full player
- Favorites
- Recently played
- Optional user account

Do not over-engineer V1.

---

## 5. Target Platform

### Required

- Android phones
- Android Studio
- Kotlin
- Jetpack Compose
- Material 3
- A current stable Android/Compose-compatible toolchain

Choose the minimum Android version based on current stable Android and library compatibility.

### V1 is Android-only

Do not build iOS, web, or desktop versions in V1.

---

## 6. Design Requirements

The UI must be:

- Mobile-first
- Responsive across common Android screen sizes
- Touch-friendly
- Modern
- Dark-mode friendly
- Fast and lightweight
- Easy to navigate with one hand
- Accessible

Suggested visual direction:

- Clean dark music-player aesthetic
- Large album/video artwork
- Clear typography
- Smooth but restrained animations
- Strong emphasis on the currently playing song
- Tamil/Telugu/Malayalam language choices clearly visible

Do not copy another application's exact UI.

---

# 7. Main User Flow

## 7.1 Launch

On launch:

1. Show ISAIYA splash screen.
2. Load application settings.
3. Load locally stored favorites/history if available.
4. Show Home.

Login must NOT be mandatory for basic usage.

---

# 8. Home Screen

The Home screen should contain:

- ISAIYA branding
- Search bar
- Selected language
- Recently played
- Recommended songs
- Tamil
- Telugu
- Malayalam
- Popular/discovery selections where data is available

Example:

```text
--------------------------------
          ISAIYA

Search songs, artists...
🔍

Language: Tamil ▼

Recently Played
[Song] [Song] [Song]

Recommended
[Song] [Song] [Song]

Tamil Music
[Song] [Song] [Song]
--------------------------------
          Mini Player
--------------------------------
Home     Search     Library
--------------------------------
```

---

# 9. Language Selection

Support:

- Tamil
- Telugu
- Malayalam
- All

Display language names appropriately:

- தமிழ்
- తెలుగు
- മലയാളം
- All

The selected language should influence:

- Search queries
- Recommendations
- Automatic queue generation

The app should NOT falsely claim that every YouTube result belongs to a particular language. Language filtering should use available metadata and/or controlled search-query strategies.

---

# 10. Search

Users can search for:

- Song title
- Artist
- Album
- Movie
- General music keywords

Examples:

```text
Why This Kolaveri Di
Anirudh
Tamil melody songs
A. R. Rahman
Malayalam hits
Telugu romantic songs
```

Search results should display:

- Thumbnail
- Title
- Channel/artist information when available
- Duration when available

Results should be deduplicated.

Search should be debounced so the app does not make unnecessary API calls for every keystroke.

---

# 11. Playback

When a user selects a result:

1. Start playback through a permitted official YouTube playback mechanism.
2. Display the current item in the app's player UI where permitted.
3. Provide standard playback controls supported by the selected integration.

Required controls where supported:

- Play
- Pause
- Seek
- Next
- Previous
- Queue
- Favorite
- Volume/device controls where appropriate

## Important YouTube restrictions

Do NOT:

- Extract YouTube audio URLs.
- Convert YouTube videos to MP3.
- Download YouTube audio/video.
- Circumvent YouTube restrictions.
- Proxy or re-host YouTube media.
- Implement unauthorized background audio playback.
- Hide required YouTube branding/attribution.
- Build an unofficial YouTube scraping/downloading system.

Before implementation, verify the current YouTube API Services Terms, developer policies, and Android playback requirements.

Use only supported playback methods.

---

# 12. Automatic Next Song

This is a core V1 feature.

When the current item finishes, ISAIYA should automatically continue with the next item in the queue without requiring the user to press Next, **provided the selected YouTube playback mechanism supports this behavior within its current policies and technical capabilities**.

Example:

```text
User selects:
Song A

Queue:
1. Song A
2. Song B
3. Song C
4. Song D
5. Song E

Song A finishes
      ↓
Song B starts automatically
      ↓
Song B finishes
      ↓
Song C starts automatically
```

If the user presses Next:

```text
Current Song
    ↓
Next Song
```

If the user presses Previous:

```text
Previous Song
```

Queue behavior must be predictable.

If YouTube's current supported playback mechanism prevents automatic transition in a particular context, do not work around the restriction. Instead, gracefully adapt the UX and document the limitation.

---

# 13. Recommendation / Queue Generation

V1 should use a simple rule-based recommendation system.

Do NOT build a complex AI recommendation engine initially.

Possible recommendation inputs:

- Current song title
- Artist/channel
- Selected language
- Search query
- Related YouTube search results
- Recently played songs
- User favorites

Basic algorithm:

```text
Current song
     ↓
Generate related search queries
     ↓
Fetch candidate results
     ↓
Remove duplicates
     ↓
Remove current item
     ↓
Filter unsuitable results
     ↓
Prioritize selected language
     ↓
Create queue
```

The system should:

- Avoid repeated songs
- Avoid repeatedly recommending the same videos
- Prefer relevant music
- Respect selected language
- Keep a reasonable queue size
- Handle API failures gracefully

Later versions can introduce more advanced personalization.

---

# 14. Skip Behavior

If a user does not like a song:

```text
⏭ Next
```

The current item should be skipped and the next queue item should be selected/playback started where supported.

V1 may record skips locally for future recommendation improvements.

Do not build machine-learning personalization in V1.

---

# 15. Mini Player

When a song is playing and the user navigates away from the player:

Show a mini player at the bottom.

Example:

```text
--------------------------------
🖼️  Song Name
    Artist       ▶ / ⏸
--------------------------------
```

Tapping it opens the full player.

The mini player should not block navigation or important content.

---

# 16. Full Player

The full player should show:

- Large artwork/thumbnail
- Song title
- Artist/channel
- Progress
- Play/pause
- Previous
- Next
- Queue button
- Favorite button

The UI should remain simple and uncluttered.

---

# 17. Queue Screen

Display:

```text
NOW PLAYING
Song A

UP NEXT

Song B
Song C
Song D
Song E
```

User should be able to:

- See upcoming songs
- Remove an item
- Change order if practical for V1
- Select an item to play where supported

Queue state should survive normal navigation within the app.

---

# 18. Favorites

Users can favorite a song.

Required:

- Add favorite
- Remove favorite
- Favorites screen
- Persist favorites locally

For logged-in users, synchronization can be added if a backend is implemented.

Do not make login mandatory just for favorites in V1.

---

# 19. Recently Played

Store a limited local history.

Example:

```text
Recently Played

Song A
Song B
Song C
Song D
```

Requirements:

- Most recent first
- Avoid excessive duplicate entries
- Allow clearing history
- Tapping an item starts playback

Do not store copyrighted media.

Store only appropriate metadata/identifiers.

---

# 20. Authentication

Authentication should be optional.

Anonymous users can:

- Search
- Browse
- Play
- Skip
- Use recommendations
- Save local favorites/history

Logged-in users may additionally get:

- Cloud-synced favorites
- Cloud playlists
- Synced history
- Preferences across devices

Authentication provider should be selected after evaluating project complexity.

Do not introduce a backend unless it is actually required.

---

# 21. Local Storage

Use a lightweight Android persistence solution appropriate for V1, such as Room or DataStore depending on the data type.

Store locally:

- Favorites
- Recently played
- Selected language
- User preferences
- Queue state if necessary

Do NOT store copyrighted YouTube media.

---

# 22. YouTube API Integration

Use official Google/YouTube developer APIs and supported playback mechanisms.

The implementation should separate:

```text
UI
 ↓
ViewModel / State
 ↓
Repository
 ↓
YouTube API / Playback Integration
```

API keys/secrets must NOT be hardcoded into source control.

Use appropriate Android configuration/local secret handling.

The project must comply with the current YouTube API Services Terms and developer policies.

---

# 23. YouTube Search Strategy

The application should optimize searches for the selected language.

Example:

Selected language:

```text
Tamil
```

Query:

```text
user query + Tamil song
```

Selected language:

```text
Malayalam
```

Query:

```text
user query + Malayalam song
```

Selected language:

```text
Telugu
```

Query:

```text
user query + Telugu song
```

This is only a starting strategy. Improve relevance using returned metadata.

Do not claim that query keywords guarantee language correctness.

---

# 24. API Quota Awareness

YouTube API quota can be limited.

The application should:

- Avoid unnecessary repeated searches.
- Debounce search input.
- Cache safe metadata where appropriate.
- Avoid continuously requesting the API.
- Handle quota errors gracefully.
- Show a useful message when the API is unavailable.
- Avoid repeatedly searching the same query unnecessarily.

Do not design V1 around unlimited YouTube API usage.

---

# 25. Error Handling

Handle:

- No internet connection
- API errors
- Quota exceeded
- Invalid/missing video
- Removed video
- Playback failure
- Empty search
- No results
- Slow network
- Authentication failure

Example:

```text
No internet connection.

Please check your connection and try again.
```

The application must not crash during normal error conditions.

---

# 26. Loading States

Use proper loading indicators.

For search:

```text
Searching...
```

For Home:

```text
Loading recommendations...
```

For playback:

```text
Loading...
```

Avoid blank screens.

---

# 27. Empty States

Favorites:

```text
No favorites yet.

Tap ❤️ on a song to save it.
```

Recently played:

```text
Nothing played yet.
```

Search:

```text
No songs found.

Try another search.
```

---

# 28. Navigation

Recommended bottom navigation:

```text
Home
Search
Library
```

Library can contain:

- Favorites
- Recently Played
- Playlists later

Settings can be accessible from Library/Profile.

---

# 29. Settings

V1 settings:

- Language preference
- Theme: System / Light / Dark
- Clear recently played
- Clear favorites if desired
- About ISAIYA
- Privacy information
- Terms / legal information
- YouTube attribution/required notices where applicable

---

# 30. Branding

Use:

**ISAIYA**

Suggested tagline:

**Your music. Your mood.**

The branding should feel:

- Modern
- Indian
- Musical
- Friendly
- Not tied exclusively to one regional language

Do not copy Spotify, YouTube Music, JioSaavn, or other competitors' logos, branding, or exact UI.

---

# 31. Performance

The app should:

- Start quickly
- Avoid unnecessary API calls
- Use efficient image loading/caching
- Avoid memory leaks
- Avoid blocking the main UI thread
- Handle poor mobile networks gracefully
- Avoid excessive background work

---

# 32. Security

Never commit:

- API keys
- OAuth secrets
- Passwords
- Private credentials

Use appropriate configuration mechanisms.

Validate external API data before displaying it.

Do not trust arbitrary remote content.

---

# 33. Accessibility

Support:

- Readable text
- Sufficient touch target sizes
- Content descriptions for icons
- Screen-reader-friendly controls
- Good contrast
- Dynamic font scaling where practical

---

# 34. Architecture

Recommended starting architecture:

```text
app/
├── data/
│   ├── remote/
│   ├── local/
│   └── repository/
│
├── domain/
│   ├── model/
│   └── usecase/
│
├── ui/
│   ├── home/
│   ├── search/
│   ├── player/
│   ├── queue/
│   ├── library/
│   └── settings/
│
├── playback/
│
├── navigation/
│
└── MainActivity
```

Use a clean, maintainable architecture, but do not create unnecessary abstraction for simple features.

Suggested pattern:

```text
Compose UI
    ↓
ViewModel
    ↓
Use Cases (only where useful)
    ↓
Repository
    ↓
Remote / Local Data Sources
```

Use unidirectional state flow where practical.

---

# 35. Recommended Technology Stack

V1 should start with:

- Kotlin
- Jetpack Compose
- Material 3
- Android Navigation
- ViewModel
- Kotlin Coroutines
- Kotlin Flow where useful
- Room for structured local data
- DataStore for preferences
- Official YouTube/Google APIs and supported playback integration
- Modern Android image loading library as appropriate

Do not add a large number of dependencies without a clear reason.

---

# 36. Development Strategy

Build V1 incrementally.

## Milestone 1 — Android Foundation

Create:

- Android project
- Kotlin
- Compose
- Material 3
- Navigation
- Theme
- ISAIYA branding
- Basic Home
- Search screen
- Library screen
- Settings screen

At the end of Milestone 1, the application should build and run on a physical Android phone/emulator.

---

## Milestone 2 — YouTube Search

Implement:

- API configuration
- Search
- Search results
- Thumbnails
- Basic metadata
- Loading states
- Empty states
- Error handling
- Quota handling

Verify searches for:

- Tamil
- Telugu
- Malayalam

---

## Milestone 3 — Playback

Implement the permitted YouTube playback integration.

Verify:

- Selecting a result
- Playback
- Player state
- Play/pause where supported
- Seek where supported
- Playback errors
- Required YouTube attribution/branding

Do not implement audio extraction.

---

## Milestone 4 — Queue

Implement:

- Queue
- Next
- Previous
- Automatic continuation where supported
- Skip behavior
- Queue screen
- Duplicate prevention

If a YouTube platform limitation prevents a desired behavior, document it and implement the closest policy-compliant UX instead of circumventing the restriction.

---

## Milestone 5 — Library

Implement:

- Favorites
- Recently played
- Local persistence
- Clear history
- Favorite/unfavorite

---

## Milestone 6 — Language & Recommendations

Implement:

- Tamil
- Telugu
- Malayalam
- All
- Language-aware search
- Rule-based recommendation queue
- Better duplicate filtering

---

## Milestone 7 — UI Polish

Improve:

- ISAIYA branding
- Typography
- Animations
- Loading states
- Empty states
- Accessibility
- Error messages
- Performance
- Dark/light/system themes

---

# 37. V1 Non-Goals

Do NOT implement these in the first version:

- Music downloading
- YouTube MP3 extraction
- Copyright circumvention
- Unofficial YouTube scraping
- Unofficial YouTube audio URLs
- Unauthorized background audio playback
- Complex AI recommendation models
- Social networking
- Messaging
- Subscription/payment system
- Desktop application
- iOS application
- Complex backend unless required
- Offline YouTube playback

---

# 38. Future V2 Ideas

Possible future features:

- Smarter recommendations
- Custom playlists
- Lyrics where legally available
- Sleep timer
- Equalizer where technically and legally appropriate
- Artist pages
- Album pages
- Mood-based recommendations
- Better personalization
- Cross-device synchronization
- Additional legal music catalogs
- More Indian languages
- Legal offline music from sources that explicitly permit downloads

---

# 39. Definition of Done

V1 is considered successful when a user can:

1. Install ISAIYA on an Android phone.
2. Open the app without creating an account.
3. Select Tamil, Telugu, Malayalam, or All.
4. Search for a song.
5. See relevant results.
6. Select a result.
7. Start playback using the permitted YouTube integration.
8. See the mini player.
9. Open the full player.
10. Continue to another relevant song automatically where supported by the playback architecture.
11. Skip to the next song.
12. Favorite a song.
13. See favorites later.
14. See recently played songs.
15. Use the application without crashes during normal operation.

---

# 40. Development Rules for Claude

When implementing this project:

1. Read this entire requirements.md before making changes.
2. Do not build the entire application in one step.
3. Work milestone by milestone.
4. After each milestone, make sure the project builds.
5. Explain important architectural decisions briefly.
6. Prefer simple, maintainable code.
7. Do not invent unsupported YouTube APIs or playback capabilities.
8. Verify current YouTube requirements before implementing playback.
9. Never implement YouTube audio extraction or downloading.
10. Keep API credentials out of source control.
11. Do not add dependencies unless necessary.
12. Handle loading, error, and empty states.
13. Test on an Android emulator and, when possible, a physical Android device.
14. Keep the UI responsive.
15. Do not replace working code unnecessarily.
16. If a requirement conflicts with a platform/API policy or technical limitation, stop and explain the conflict before implementing a workaround.
17. Keep V1 focused on:

**Search → Play → Automatically Continue → Skip → Save Favorites**

---

# 41. First Task

Start with **Milestone 1 only**.

Before writing substantial code:

1. Confirm the Android/Kotlin/Compose architecture.
2. Confirm the minimum Android SDK choice.
3. Propose the initial project/folder structure.
4. Create the basic ISAIYA application.
5. Implement navigation between:
   - Home
   - Search
   - Library
   - Settings
6. Add ISAIYA branding and a basic theme.
7. Make sure the project builds successfully.
8. Do NOT implement YouTube playback yet.

After Milestone 1 is complete, stop and report:

- Files created/changed
- What works
- How to run the app
- Any issues
- What will be done in Milestone 2

Then wait for approval before proceeding.
