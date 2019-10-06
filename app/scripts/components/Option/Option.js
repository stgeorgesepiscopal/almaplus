import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import { Button, TextField, Switch, FormGroup, FormControlLabel, MenuItem, Select, InputLabel, Checkbox, Input, Chip, FormControl,  } from '@material-ui/core';

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
      formControl: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        marginTop: theme.spacing(2),
        width: "100%"
      },
      chips: {
        display: 'flex',
        flexWrap: 'wrap',
      },
      chip: {
        margin: 2,
      },

    }));

    function getStyles(name='Option', personName='', theme) {
        return {
          fontWeight:
            personName.indexOf(name) === -1
              ? theme.typography.fontWeightRegular
              : theme.typography.fontWeightMedium,
        };
      }

      const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};


export function Option(props) {
    
    
        

        const { type, name, label, menuItems, ...other } = props;
        const [value, update] = useStore(options[name], options.defaults[name]);

        const classes = useStyles();
        const theme = useTheme();

        async function handleChange(e) {
            e.persist();
            const caretStart = e.target.selectionStart;
            const caretEnd = e.target.selectionEnd;
            await update(e.target.value);
            e.target.setSelectionRange(caretStart, caretEnd);
        }

        async function handleChangeMultiple(e) {
            //const { options } = e.target;
            //const value = [];
            //for (let i = 0, l = options.length; i < l; i += 1) {
            //  if (options[i].selected) {
            //    value.push(options[i].value);
            //  }
            //}
            await update(e.target.value);
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
                <FormControl className={classes.formControl}><FormGroup ><FormControlLabel control={
                    <Switch checked={value} onChange={e => update(e.target.checked)} value={name} color="primary" {...other}></Switch>
                } label={ label ? label : startCase(name) + "?" }
                ></FormControlLabel></FormGroup></FormControl>

            );
        }
        if ( type == "checkbox" ){
            return(
                <FormControl className={classes.formControl}><FormGroup ><FormControlLabel control={
                    <Checkbox checked={value} onChange={e => update(e.target.checked)} value={name} color="primary" {...other}></Checkbox>
                } label={ label ? label : startCase(name) + "?" }
                ></FormControlLabel></FormGroup></FormControl>

            );
        }
        if (type == "select" ){
            const menuItems = props.menuItems.map(({value, label}) => (
                <MenuItem value={value} key={value}>{label}</MenuItem>
                ));
            return(
                <>
                <FormControl className={classes.formControl}>
                <InputLabel htmlFor={name}>{ label ? label : startCase(name) }</InputLabel>
                <Select
                value={value}
                onChange={e => update(e.target.value)}
                inputProps={{
                    name: name,
                    id: name,
                }}
                {...other}
                >
                {menuItems}
                </Select>
                </FormControl>
                </>
            
            );
        }
        if (type == "multiselect"){

            return(
                <>
                <FormControl className={classes.formControl}>
                    <InputLabel htmlFor="select-multiple-chip">{ label ? label : startCase(name) }</InputLabel>
                    <Select
                    multiple
                    fullWidth
                    value={value}
                    onChange={async (e) => await handleChangeMultiple(e)}
                    input={<Input id="select-multiple-chip" />}
                    renderValue={value => (
                        <div className={classes.chips}>
                        {value.map(value => (
                            <Chip key={value} label={value} className={classes.chip} />
                        ))}
                        </div>
                    )}
                    MenuProps={MenuProps}
                    >
                    {props.menuItems.map(({value, label})  => (
                        <MenuItem key={value} value={value} style={getStyles(value, label, theme)}>
                        {label}
                        </MenuItem>
                    ))}
                    </Select>
                </FormControl>

                </>
            )
        }
    
  }
  
  Option.propTypes = {
    type: PropTypes.string,
    name: PropTypes.string,
    label: PropTypes.string,
    
  };
  

export default Option

