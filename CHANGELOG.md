### 1.0.5

#### Bug fixes

- The configuration of the folder to look for sections components isn't flexible enough due to limitations with dynamic import(), we had to remove this feature for now and define the folder. Updated the readme accordingly
- Fixed SSR compilation errors
- SSR request to get a page wasn't following the security flow imposed by Sections, this is now fixed
- Toast are not support on SSR side, when running in SSR, replaced toast warning by console.log

#### Additional features

- Fixed the issues with SSR support
- Added the ability to specify
- Added Axios caching on requests to optimize performances

### 1.0.4

#### Additional features

Native support of NUXT*ENV* variables for easy integration in a NuxtJS project

### 1.0.3

Removing Consoles

### 1.0.2

#### Bug fixes

The sections server URL is now production by default

#### Additional Features

Ability to point to test url with the right env. variable

### 1.0.1

#### Bug fixes

Properly include language files for both en and fr versions

#### Additional Features

None

### 1.0.0

Launch of this library
