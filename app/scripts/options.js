import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { Button, TextField, Switch, FormGroup, FormControlLabel } from '@material-ui/core';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar'
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';


import Typography from '@material-ui/core/Typography';
import InputAdornment from '@material-ui/core/InputAdornment';
import CssBaseline from '@material-ui/core/CssBaseline';

import SvgIcon from '@material-ui/core/SvgIcon'
import CheckIcon from '@material-ui/icons/Check'

import { options, useStore, inputId, searchData, watchers } from './storage';
import FileInput from './components/FileInput/FileInput';
import {Option} from './components/Option/Option';
import {TabPanel, a11yProps} from './components/TabPanel/TabPanel'

import {saveNote} from './alma'

import {closeWindow, log} from './util'


const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
  title: {
    flexGrow: 1,
    
  },
    container: {
      display: 'flex',
      flexWrap: 'wrap',
    },
    button: {
        margin: theme.spacing(1),
        width: 50,
        
      },

  }));


  var gradeLevels = [];
  async function getGradeLevels() {
    gradeLevels = await searchData.gradeLevels.get()
    
    return gradeLevels
  }

function App() {
    const classes = useStyles();
    var values = [];
    var updates = [];
    

    
    getGradeLevels()
    
    
    Object.entries(options.defaults).forEach(async ([key, value]) => {
      const [v, u] = useStore(options[key], value);
      values[key] = v;
      updates[key] = u;
    });

    const [message, u] = useStore(searchData.messages, [])
    
    async function handleChange(e) {
        e.persist();
        const caretStart = e.target.selectionStart;
        const caretEnd = e.target.selectionEnd;
        await updates[e.target.name](e.target.value);
        e.target.setSelectionRange(caretStart, caretEnd);
    }

    const [tabValue, setTabValue] = React.useState(0);

    function handleTabChange(event, newValue) {
      setTabValue(newValue);
    }

  async function handleApiCredentialFile(newValue) {
    await updates['googleApiCredentials'](btoa(JSON.stringify(newValue)))
    await updates['googleApiAccount'](JSON.parse(newValue).client_email)
    return true
  }

  function testNote() {
    saveNote("Test. Delete me.")

  }

  async function resetNotes() {
    await searchData.notes.set([])
    watchers.notesWatcher.get().then((v) => {watchers.notesWatcher.set(!v)})

  }

  function searchOptions(isAdmin){
    if(isAdmin){
      return [
        {label: "Directory", value:"search"}, 
        {label: "Alma Start", value:"start"}, 
        {label: "Location", value:"locate"}
      ]

    } else {
      return [
        {label: "Directory", value:"search"}, 
        {label: "Location", value:"locate"}
      ]

    }

  }
  

  


  

  return (
    <React.Fragment>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" className={classes.title} noWrap>Alma+ Settings</Typography>
            <Button className={classes.button} color="primary" size="small" onClick={closeWindow}>
              <CheckIcon></CheckIcon>
            </Button>
          </Toolbar>
        </AppBar>
        
        <div className={classes.root}>
        
        <AppBar position="static">
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="simple tabs example" variant="fullWidth" indicatorColor="primary"
          textColor="primary">
            <Tab label="Basic Options" {...a11yProps(0)} />
            <Tab label="Attendance" {...a11yProps(1)} style={{display: ((values['adminMode']) ? '' : 'none') }} />
            <Tab label="Messaging" {...a11yProps(2)} />
            <Tab label="Other" {...a11yProps(3)} />
            <Tab label="Alma Start" {...a11yProps(4)} style={{display: ((values['almaStart']) ? 'block' : 'none') }} />
            <Tab label="Developer" {...a11yProps(5)} style={{display: ((values['debug']) ? 'block' : 'none') }} />
          </Tabs>
        </AppBar>

        <CssBaseline />
    
        
        <form className={classes.container} noValidate autoComplete="off">
          
          {/* Basic Options */}
          <TabPanel value={tabValue} index={0}> 
            <Option type="text" name="subdomain" 
              InputProps={{
                startAdornment: <InputAdornment position="start">https://</InputAdornment>,
                endAdornment: <InputAdornment position="end">.getalma.com</InputAdornment>,
              }}
            />
            <Option type="text" name="apiStudentUUID" style={{display: ((values['adminMode']) ? '' : 'none') }}  />
            <Option type="checkbox" name="adminMode" label="School Admin Mode?" />
            <Option type="checkbox" name="almaStart" style={{display: ((values['adminMode']) ? '' : 'none') }} />
            <Option type="select" name="defaultSearch" menuItems={searchOptions(values['adminMode'])} />
            <Option type="checkbox" name="debug" style={{display: ((values['adminMode']) ? '' : 'none') }} />
          </TabPanel>
          
          {/* Attendance */}
          <TabPanel value={tabValue} index={1}> 
            <Option type="checkbox" name="reportingComplianceTab" label="Display Compliance Reporting Tab?" style={{display: ((values['adminMode']) ? '' : 'none') }}  />
            <Option type="checkbox" name="reportingTranscriptsTab" label="Display Transcripts Reporting Tab?" style={{display: ((values['adminMode']) ? '' : 'none') }} />
            <Option type="multiselect" name="attendanceIgnoreClasses" menuItems={ gradeLevels } style={{display: ((values['adminMode']) ? '' : 'none') }}  />
          </TabPanel>

          {/* Messaging */}
          <TabPanel value={tabValue} index={2}> 
            <Option type="checkbox" name="htmlMessaging"  />
            <Option type="text" name="signature" multiline />
          </TabPanel>

          {/* Other */}
          <TabPanel value={tabValue} index={3}> 
            <Option type="checkbox" name="displayChat" label="Display Support Chat Icon?"  />
            <Option type="checkbox" name="stayAlive" label="Prevent Auto-Logout?"  />
          </TabPanel>

          {/* Alma Start */}
          <TabPanel value={tabValue} index={4}> 
            <Option type="checkbox" name="almaStartPDFButtons"  />
            <Option type="checkbox" name="almaStartIgnoreEnrolled"  />
            <Option type="checkbox" name="almaStartIncludeNotesInSearch"  />
            <Option type="checkbox" name="almaStartIgnoreApplicants"  />
            <Option type="checkbox" name="almaStartBrowserNotifications"  />
            <Option type="checkbox" name="almaStartEmailNotifications"  />
            <Option type="text" name="almaStartNewNoteTemplate" multiline />
          </TabPanel>

          {/* Developer */}
          <TabPanel value={tabValue} index={5}> 
          <Typography>Warning! Don't mess with these unless you know what you're doing!</Typography>
            <Button onClick={resetNotes}>Reset Notes</Button>
          </TabPanel>

        </form>

      </div>
{/* 
      <FileInput label="Google Credentials JSON" callback={handleApiCredentialFile}></FileInput>
      {values['googleApiAccount']}
      <CssBaseline />
      <TextField
        id="sheetId"
        label="Google Sheets ID"
        className={classes.textField}
        fullWidth
        multiline
        name="sheetId"
        value={values['sheetId']}
        onChange={async (e) => await handleChange(e)}
        <Button className={classes.button} color="primary" size="small" onClick={testNote}
    >Test Notes</Button>
    />
    */}  
    </React.Fragment>
      

    

      
    
    
  );
}

ReactDOM.render(<App />, document.querySelector('#options'));