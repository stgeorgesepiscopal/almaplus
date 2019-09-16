import React, {useEffect, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import CheckIcon from '@material-ui/icons/Check'
import {isFunction} from '../../util'

const useStyles = makeStyles(theme => ({
    button: {
      margin: theme.spacing(1),
    },
    input: {
      display: 'none',
    },
  }));

const noop = () => {}

const useFileReader = options => {
  const { method = 'readAsText', onload: onloadHook = noop } = options
  const [file, setFile] = useState(null)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!file) return
    const reader = new FileReader(file)
    reader.onloadstart = () => {
      setLoading(true)
    }
    reader.onloadend = () => {
      setLoading(false)
    }
    reader.onload = e => {
      console.log(onloadHook)
      setResult(e.target.result)
      onloadHook(e.target.result)
    }
    reader.onError = e => {
      setError(e)
    }
    try {
      reader[method](file)
    } catch (e) {
      setError(e)
    }
  }, [file])

  return [{ result, error, file, loading }, setFile]
}


const FileInput = prop => {
    const classes = useStyles();
    console.log(prop)

    const [{ result, error, loading }, setFile] = useFileReader({
      method: 'readAsText',
      onload: isFunction(prop.callback) ? prop.callback : noop
    })
   
    const onInputFile = e => {
      setFile(e.target.files[0])
    }
   
    return (
      <>
        {loading ? <p>Reading file</p> : null}
        {error ? <p>{error.message}</p> : null}
        {result ? <CheckIcon/> : null}
        <input
        accept=".json"
        className={classes.input}
        id="contained-button-file"
        multiple
        onInput={onInputFile}
        type="file"
      />
      <label htmlFor="contained-button-file">
        <Button variant="contained" component="span" className={classes.button}>
          Upload {prop.label}
        </Button>
      </label>
      </>
    )
  }

  export default FileInput