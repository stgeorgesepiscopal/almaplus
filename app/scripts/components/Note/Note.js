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
    
        const { name, body, date, ...other } = props;
        

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
                <li>
                  <span className="date dimmed">{date}</span>
                  <img src="data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIGJhc2VQcm9maWxlPSJmdWxsIiB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMzAiIGZpbGw9IiMzZmMxYzgiIC8+PHRleHQgeD0iMzAiIHk9IjQxLjIiIGZvbnQtZmFtaWx5PSJIZWx2ZXRpY2EiIGZvbnQtc2l6ZT0iMzIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNmZmZmZmYiPlJNPC90ZXh0Pjwvc3ZnPg==" alt="" className="photo profile-pic profile-pic-medium" />
                  <h5>{name}</h5>
                  <p>{body}</p>
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
  const notes = props.notes
  const noteArray = notes.map( (n) => <Note key={n.uuid} name={n.name} date={n.date} body={n.body} ></Note> )
  
  return (<><ul>{noteArray}</ul></>);
  
  //const [notes, u] = useStore(searchData.notes, [])
  //return  (<><ul><li>Something</li></ul></>);
  
}
  

export default Note

