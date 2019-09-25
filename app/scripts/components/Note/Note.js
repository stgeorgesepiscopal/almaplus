import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import { Button, TextField, Switch, FormGroup, FormControlLabel, MenuItem, Select, InputLabel, Checkbox, Input, Chip, FormControl,  } from '@material-ui/core';

import {startCase} from 'lodash'

import { options, searchData, useStore, inputId } from '../../storage';

const useStyles = makeStyles(theme => ({
    
      button: {
          margin: theme.spacing(1),
          width: 50,
          
        },
      notes: {
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap'
      },
      note : {
        marginLeft: '5px'
      },
      noteh5: {
        fontSize: '12px !important',
        display: 'inline',
        paddingLeft: '5px'
      },
      noteDate: {
        fontSize: '10px',
        float: 'none !important'
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

    function getStyles(name, personName, theme) {
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

export function Note(props) {
    
        const { author, body, date, ...other } = props;
        

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
    
        
            return (
              <>
                <li className={classes.note}>
                  <p>{body}</p>
                  <span className={classes.noteDate +" date dimmed"} >{date}</span>
                  <img src={chrome.runtime.getURL('images/icon-128.png')} alt="" className="photo profile-pic profile-pic-medium" />
                  <h5 className={classes.noteh5}>{author}</h5>
                  
                </li>
              </>
            );
        
        
    
  }
  
  Note.propTypes = {
    date: PropTypes.string,
    name: PropTypes.string,
    body: PropTypes.string,
    
  };

  

export function Notes(props) {
  const classes = useStyles();
  const notes = props.notes
  const noteArray = notes.map( (n) => <Note key={n.uuid} author={n.author} date={n.date} body={n.body} ></Note> )
  
  return (<><ul className={classes.notes} id="noteList">{noteArray}</ul></>);
  
  //const [notes, u] = useStore(searchData.notes, [])
  //return  (<><ul><li>Something</li></ul></>);
  
}
  

export default Note
