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

import { options, useStore, inputId, searchData } from './storage';
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
    console.log(gradeLevels)
    
    Object.entries(options.defaults).forEach(async ([key, value]) => {
      const [v, u] = useStore(options[key], value);
      values[key] = v;
      updates[key] = u;
    });
    
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

  

  


  

  return (
    <React.Fragment>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" className={classes.title} noWrap>
            Alma+ Settings
            
          </Typography>
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
            <Tab label="Attendance" {...a11yProps(1)} />
            <Tab label="Messaging" {...a11yProps(2)} />
            <Tab label="Other" {...a11yProps(3)} />
            <Tab label="Alma Start" {...a11yProps(4)} style={{display: ((values['almaStart']) ? 'block' : 'none') }} />
          </Tabs>
        </AppBar>
    <CssBaseline />
    
        
      <form className={classes.container} noValidate autoComplete="off">
      <TabPanel value={tabValue} index={0}>
        <Option type="text" name="subdomain" 
          InputProps={{
            startAdornment: <InputAdornment position="start">https://</InputAdornment>,
            endAdornment: <InputAdornment position="end">.getalma.com</InputAdornment>,
          }} />
          <Option type="text" name="apiStudentUUID"  />
          <Option type="switch" name="almaStart" />
          <Option type="select" name="defaultSearch" menuItems={[{label: "Directory", value:"search"}, {label: "Alma Start", value:"start"}, {label: "Location", value:"locate"}]} />
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
      
      <Option type="multiselect" name="attendanceIgnoreClasses" menuItems={ gradeLevels }   />
      
    </TabPanel>

     <TabPanel value={tabValue} index={2}>
      
      <Option type="switch" name="htmlMessaging"  />
      <Option type="text" name="signature" multiline />
    </TabPanel>
    <TabPanel value={tabValue} index={3}>
      <Option type="switch" name="displayChat"  />
      <Option type="switch" name="stayAlive"  />
    </TabPanel>
    <TabPanel value={tabValue} index={4}>
    <Option type="checkbox" name="almaStartPDFButtons"  />
    <Option type="checkbox" name="almaStartIgnoreEnrolled"  />
    <Option type="checkbox" name="almaStartIgnoreApplicants"  />
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
        
    />
    */}  

    <Button className={classes.button} color="primary" size="small" onClick={testNote}
    >Test Notes</Button>

      </TabPanel>
    
    </form>
    </div>
    </React.Fragment>
  );
}

ReactDOM.render(<App />, document.querySelector('#options'));