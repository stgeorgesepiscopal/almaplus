import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import { Button, TextField, Switch, FormGroup, FormControlLabel, MenuItem, Select, InputLabel } from '@material-ui/core';

import {startCase} from 'lodash'

import { options, useStore, inputId } from '../../storage';

const useStyles = makeStyles(theme => ({
    
      button: {
          margin: theme.spacing(1),
          width: 50,
          
        },
      textField: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        marginTop: theme.spacing(2),
      },

    }));

export function Option(props) {
    
    
        

        const { type, name, label, ...other } = props;
        const [value, update] = useStore(options[name], options.defaults[name]);

        const classes = useStyles();

        async function handleChange(e) {
            e.persist();
            const caretStart = e.target.selectionStart;
            const caretEnd = e.target.selectionEnd;
            await update(e.target.value);
            e.target.setSelectionRange(caretStart, caretEnd);
        }
    
        if ( type == "text" ){
            return (
                <TextField
                id={name}
                label={ label ? label : startCase(name) }
                className={classes.textField}
                name={name}
                value={value}
                onChange={async (e) => await handleChange(e)}
                fullWidth
                {...other}
                
                />
            );
        }
        if ( type == "switch" ){
            return(
                <FormGroup ><FormControlLabel control={
                    <Switch checked={value} onChange={e => update(e.target.checked)} value={name} color="primary" ></Switch>
                } label={ label ? label : startCase(name) + "?" }
                ></FormControlLabel></FormGroup>

            );
        }
        if (type == "select" ){
            const menuItems = props.menuItems.map(({value, label}) => (
                <MenuItem value={value} key={value}>{label}</MenuItem>
                ));
            return(
                <>
                <InputLabel htmlFor={name}>{ label ? label : startCase(name) }</InputLabel>
                <Select
                value={value}
                onChange={e => update(e.target.value)}
                inputProps={{
                    name: name,
                    id: name,
                }}
                >
                {menuItems}
                </Select>
                </>
            
            );
        }
    
  }
  
  Option.propTypes = {
    type: PropTypes.string,
    name: PropTypes.string,
    label: PropTypes.string,
    
  };
  

export default Option

