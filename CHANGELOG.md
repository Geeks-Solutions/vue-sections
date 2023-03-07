### 1.0.20
#### Additional Feature

- Adding anchor id for all section types (#sectionName-sectionId)
- Showing anchor icon (to copy anchor id) next to the edit, drag and delete icons in edit mode 

### 1.0.19
#### Additional features

- Handle properly query strings on the library
- Added authorization for the configurable sections on a project
- Fix the display of configurable sections
- Support custom form for configurable sections
- Implemented import/export sections feature for pages

### 1.0.18
#### Bug Fix

- Fix Edit page glitch when user try to edit an old version of the page

### 1.0.17
#### Additional features

- Update globalFileUpload media to delete old media when uploading new one
- Add function to delete media after uploading it

### 1.0.16
#### Bug Fixes

- Fixed style glitch on the delete section type to fix
- When edit a page with no sections folder present show the error instead of an undefined error.
- Padding fixes

### 1.0.15
#### Bug Fixes

- Fixed display of the delete section type
- Fixed style of delete popup buttons
- Fixed error not showing correctly when deleting a used static section type
- update sections server url to point to the subdomain

### 1.0.14
#### Additional features

- Update the library to have it export a new helper function that allow adding a new section type
- Update the UI to be able to delete a newly created static section type 
- Fixes errors when creating/editing a website, deleting section type, creating new section type
- Fix Wysiwyg section type to take the apply style
- Refresh section types when creating a new section type

### 1.0.13 
#### Additional features

- Update the library to have it use media in the wysiwyg and the static components
- Update the media to use sections server URL + Update readme to include Tailwind Support 

### 1.0.9

#### Bug Fixes

- Properly build update to include it in the esm scripts

### 1.0.8

#### Additional features

- Emit a load event when the sections are loaded

### 1.0.7

#### Bug fixes

- Fixes the loading indicator on page view, page save and edit mode activation
- Fixes the display of the create new page button for logged in users only
- Code cleanup to remove axios cache plugin that is not being used now

### 1.0.6

#### Bug fixes

- Fixed an issue when adding or editing an internal wysiwyg section
- Few typo mistakes on labels

### 1.0.5

#### Bug fixes

- The configuration of the folder to look for sections components isn't flexible enough due to limitations with dynamic import(), we had to remove this feature for now and define the folder. Updated the readme accordingly
- Fixed SSR compilation errors
- SSR request to get a page wasn't following the security flow imposed by Sections, this is now fixed
- SSR compilation is now fixed
- Toast are not support on SSR side, when running in SSR, replaced toast warning by console.log

#### Additional features

- Added the ability to specify the Server URL through a config.
- Added the ability to specify the project URL through a config. for SSR security

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
