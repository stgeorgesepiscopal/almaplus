import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { Button, TextField, Switch, FormGroup, FormControlLabel } from '@material-ui/core';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar'
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import InputAdornment from '@material-ui/core/InputAdornment';
import CssBaseline from '@material-ui/core/CssBaseline';

import SvgIcon from '@material-ui/core/SvgIcon'
import CheckIcon from '@material-ui/icons/Check'

import { options, useStore, inputId } from './storage';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <Typography
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      <Box p={3}>{children}</Box>
    </Typography>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}


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
    textField: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
      marginTop: theme.spacing(2),
    },
    dense: {
      marginTop: theme.spacing(2),
    },
    menu: {
      width: 200,
    },
  }));



function closeWindow() {

    
  window.close();
}
  

  

function App() {
    const classes = useStyles();
    var values = [];
    var updates = [];
    
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
            <Tab label="Messaging" {...a11yProps(1)} />
            <Tab label="Other" {...a11yProps(2)} />
            <Tab label="Alma Start" {...a11yProps(3)} style={{display: ((values['almaStart']) ? 'block' : 'none') }} />
          </Tabs>
        </AppBar>
    <CssBaseline />
    
        
      <form className={classes.container} noValidate autoComplete="off">
      <TabPanel value={tabValue} index={0}>
        <TextField
        id="subdomain"
        label="Subdomain"
        className={classes.textField}
        name="subdomain"
        value={values['subdomain']}
        onChange={async (e) => await handleChange(e)}
        fullWidth
        
        InputProps={{
            startAdornment: <InputAdornment position="start">https://</InputAdornment>,
            endAdornment: <InputAdornment position="end">.getalma.com</InputAdornment>,
        
          }}
    />
    <TextField
        id="apiStudent"
        label="API Student UUID"
        className={classes.textField}
        fullWidth
        name="apiStudent"
        value={values['apiStudent']}
        onChange={async (e) => await handleChange(e)}
        
    />
    <FormGroup row>
      
      <FormControlLabel
        control={
          <Switch checked={values['almaStart']} onChange={e => updates['almaStart'](e.target.checked)} value="almaStart" color="primary"></Switch>
        }
        label="Show options for Alma Start?"
      ></FormControlLabel>
      
      </FormGroup>
    
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
    <CssBaseline />
    <FormGroup row>
     
      <FormControlLabel
        control={
          <Switch checked={values['htmlMessaging']} onChange={e => updates['htmlMessaging'](e.target.checked)} value="htmlMessaging" color="primary"></Switch>
        }
        label="Use HTML Messaging?"
      ></FormControlLabel>
     
      </FormGroup>
    <TextField
        id="signature"
        label="Messaging Signature"
        className={classes.textField}
        fullWidth
        multiline
        name="signature"
        value={values['signature']}
        onChange={async (e) => await handleChange(e)}
        
    />
    </TabPanel>
    <TabPanel value={tabValue} index={2}>
    <CssBaseline />
   <FormGroup row>
      <FormControlLabel
        control={
          <Switch checked={values['displayChat']} onChange={e => updates['displayChat'](e.target.checked)} value="displayChat" color="primary"></Switch>
        }
        label="Display Chat Link?"
      ></FormControlLabel>
      <FormControlLabel
        control={
          <Switch checked={values['stayAlive']} onChange={e => updates['stayAlive'](e.target.checked)} value="stayAlive" color="primary"></Switch>
        }
        label="Stay Alive (prevent auto-logout)?"
      ></FormControlLabel>
      
      
      
      </FormGroup>
      

      </TabPanel>
      <TabPanel value={tabValue} index={3}>
    <CssBaseline />
   <FormGroup row>
      <FormControlLabel 
        control={
          <Switch checked={values['almaStartPDFs']} onChange={e => updates['almaStartPDFs'](e.target.checked)} value="almaStartPDFs" color="primary" ></Switch>
        }
        label="[Alma Start] Generate PDFs?"
      ></FormControlLabel>
      </FormGroup>
      

      </TabPanel>
       
    </form>
    </div>
    </React.Fragment>
  );
}

ReactDOM.render(<App />, document.querySelector('#options'));