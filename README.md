# almaplus

Alma is an amazing SIS, but there are little things about it that would be more helpful for our school if they were slightly different. This extension attempts to bridge some of those gaps.

## Features

### Super-Powered Search:
- Type "alma" and a space in the omnibox (location bar) to activate Alma+ SuperSearch in the browser from anywhere. 
- Use commands to search things other than the directory by using the following as the first word of your search: 
    - _search_ does a default directory search
    - _email_ searches by email address [*Requires API Student]
    - _locate_ (or _whereis_) searches for where a student is currently located
    - _start_ (or _as_) searches Alma Start processes
    - _help_ searches the Alma help documentation
- You can select a default SuperSearch command in the options
- This works on the actual Alma site as well!

### Alma Start Enhancements
- Download PDFs of full processes
- Preview uploads on the process review screen
- Keep notes concerning applicants
- Ability to ignore applicants/enrolled students in searches

### Attendance Enhancements
- Find out which teachers have not yet turned in attendance
- Ignore grade levels when checking attendance

### Messaging Enhancements
- Provide a default signature (or template) for your messages
- Ability to use HTML in emails

### User Interface Enhancements/Additions
- Individual tabs for each Spreadsheet Data Editor
- Ability to re-add the support chat to the main Alma site



## SETUP INSTRUCTIONS:

The most important settings are:
1) subdomain (the part before "getalma.com")
2) API Student UUID

To set up the extension, a fake "API Student" needs to be created. They do not need to be actively enrolled, so it shouldn't mess with your numbers. Just enroll them in a future year, or on the last day of school, or whatever. What you need is the bunch of numbers and letters that show up in the URL for their directory page.  Without this student created, you can not search by email or store notes for Alma Start.

## Install

To just install and run it as a user, visit the [Chrome Web Store](https://chrome.google.com/webstore/detail/alma%20/jigoobecgfellbfdicpijmogdkapijio)
Otherwise, download the source with `git clone`

	$ npm install

## Development

    npm run dev chrome
    npm run dev firefox
    npm run dev opera
    npm run dev edge

## Build

    npm run build chrome
    npm run build firefox
    npm run build opera
    npm run build edge

## Environment

The build tool also defines a variable named `process.env.NODE_ENV` in your scripts. 

## Credits

* Built using [webextension-toolbox](https://github.com/HaNdTriX/webextension-toolbox)
* Implements React/ReactDOM
* Icon by [freepik](https://www.flaticon.com/authors/freepik) from [flaticon.com](https://www.flaticon.com/)