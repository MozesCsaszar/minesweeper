import { Button, TextField, Link, ToggleButton, ToggleButtonGroup, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import { Dispatch, ReactElement, ReactNode, SetStateAction, useState, MouseEvent, useEffect } from 'react';
import { TextFieldValidator, ValidateApparence } from './validators';
import { addKeyToFilterSearchParams, getFilterValueFromParams, removeKeyFromFilter, updateSearchParams } from './navigation';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import Tooltip from '@mui/material/Tooltip';
import InfoIcon from '@mui/icons-material/Info';

export function createTooltip(title: string, child: ReactElement, placement: 'right' | 'bottom' = 'right'): ReactElement {
    return <Tooltip placement={placement} title={title} arrow>{child}</Tooltip>;
}

export function createInfoTooltip(title: string, child: ReactElement): ReactElement {
    return <div className='flex flex-row'>
        {<div className='flex flex-col basis-[100%]'>{child}</div>}
        {createTooltip(title, <InfoIcon className='basis-6 m-auto' />)}
    </div>
}



// TODO: Change most of these into components

/**
 * Create the state parameters for a validated input
 * @param defVal the default value for the input
 * @returns A list with the state variables message, setMessage, value, setValue
 */
function createValidatedState(defVal: string): [string, Dispatch<SetStateAction<string>>, string, Dispatch<SetStateAction<string>>] {
    return [...useState(''), ...useState(defVal)]
}

/**
 * Set the value of an input using setValue to value, then validate it
 * @param value The value to set the input to
 * @param setValue The setter for the value of the input
 * @param setMessage The setter for the message of the input
 * @param validators A list of validators for the input
 * @param onValidChange An extra function to run when the change was valid
 * @returns At return, the message of the will be '' or a validator error, the value of the input will be value
 */
function setValueValidate(value: string, setValue: Dispatch<SetStateAction<string>>, setMessage: Dispatch<SetStateAction<string>>,
    validators: TextFieldValidator[], onValidChange: (value: string) => void = (value: string) => { }) {
    setValue(value);

    for (let v of validators) {
        let m = v(value);
        if (m != '') {
            setMessage(m);
            return;
        }
    }

    setMessage('');
    onValidChange(value);
}

/**
 * Check if a form is valid based on the messages
 * @param messages The messages of the inputs from a form
 * @returns True if there are no errors, false otherwise
 */
export function isFormValid(messages: string[], hidden: boolean[]): boolean {
    return messages.every((value, i) => hidden[i] || value == '');
}

/**
 * A type holding all of the information needed to create a TextField input
 */
interface InputFieldCreationProps {
    name: string,
    validators?: ((value: string) => string)[]
    defVal?: string,
    required?: boolean,
    hidden?: boolean,
    disabled?: boolean,
    onValidChange?: (value: string) => void
}

/**
 * A type holding all of the information needed to create a TextField input, with no values as that are undefined
 */
interface DefiniteInputFieldCreationProps {
    name: string,
    validators: ((value: string) => string)[]
    defVal: string,
    required: boolean,
    disabled: boolean,
    hidden: boolean,
    onValidChange: (value: string) => void
}

// TODO: Throw error if defVal is '' and required is true
function replaceOptionalInputFieldProps<T extends InputFieldCreationProps>(props: T): T {
    if (props.defVal == undefined) {
        props.defVal = '';
    }
    if (props.required == undefined) {
        props.required = false;
    }
    if (props.onValidChange == undefined) {
        props.onValidChange = () => { };
    }
    if (props.validators == undefined) {
        props.validators = [];
    }
    if (props.hidden == undefined) {
        props.hidden = false;
    }
    return props;
}

// TODO: name this better
/**
 * A type that collects all of the information from a created input
 */
type InputFieldData = [ReactElement, string, string, Dispatch<SetStateAction<string>>];

/**
 * Creates and returns the components of a MUI TextField that is validated by a set of validators
 * @param name The label (and also the key) of the TextField
 * @param defVal The default value of the TextField
 * @param validators A list of TextFieldValidators that the value must be validated against; the field is only considered valid if it passes all validators
 * @param onValidChange A function to call when a valid change is detected
 * @returns A list containing three elements: the TextField ReactElement, the value of the validator message and the value of the TextField
 */
export function createValidatedTextField(props: InputFieldCreationProps): InputFieldData {
    const { name, defVal, disabled, required, onValidChange, validators, hidden } = replaceOptionalInputFieldProps(props) as DefiniteInputFieldCreationProps;

    const [message, setMessage, value, setValue] = createValidatedState(defVal);

    return [<>
        <InputLabel sx={{ display: hidden ? 'none' : null }}>{name}</InputLabel>
        <TextField key={name} disabled={disabled} onChange={
            (e) => setValueValidate(e.target.value, setValue, setMessage, validators, onValidChange)
        } error={message != ''} required={required} value={value} sx={{ display: hidden ? 'none' : null }} helperText={message} variant='standard'></TextField>
    </>
        , message, value, setValue]
}

/**
 * A type to collect all of the information needed to create a ToggleButtonGroup
 */
interface ToggleButtonGroupCreationProps extends InputFieldCreationProps {
    values: string[],
    names?: ((v: string) => string) | string[],
}

/**
 * A type to collect all of the information needed to create a ToggleButtonGroup with no values as undefined
 */
interface DefiniteToggleButtonGroupCreationProps extends DefiniteInputFieldCreationProps {
    values: string[],
    names: string[],
}

/**
 * Replace the optional values of the props with the default ones
 * @param props The properties to process
 * @returns The props with the replaced default values
 */
function replaceOptionalButtonGroupCreationProps(props: ToggleButtonGroupCreationProps): DefiniteToggleButtonGroupCreationProps {
    props = replaceOptionalInputFieldProps(props);
    if (props.names == undefined) {
        props.names = (v) => v;
    }
    if (!Array.isArray(props.names)) {
        props.names = props.values.map(props.names);
    }
    return props as DefiniteToggleButtonGroupCreationProps;
}

/**
 * Create a ToggleButtonGroup from provided variables
 * @param name Used as the key and aria-label for the label and ToggleButtonGroup
 * @param label The text of the label for the toggle button group
 * @param values the values that the toggle button group has
 * @param defVal the default value of the toggle button group
 * @param onValidChange a function to call when onChange happens and the value change is valid
 * @param names either a function to map the values to the names of the ToggleButtons or a list of strings that are these names
 * @returns 
 */
export function createToggleButtonGroup(props: ToggleButtonGroupCreationProps): InputFieldData {
    function createToggleButton(value: string, label: string) {
        return <ToggleButton key={value} sx={{ border: 'none' }} value={value} aria-label={value}>{label}</ToggleButton>
    }

    function createToggleButtons(values: string[], labels: string[]) {
        return values.map((v, i) => createToggleButton(v, labels[i]));
    }

    function onChange(event: MouseEvent<HTMLElement>, value: any) {
        if (!required || (required && value)) {
            setValueValidate(value ?? '', setValue, setMessage, [ValidateApparence(values, !required)], onValidChange);
        }
    }

    let { name, values, defVal, disabled, names, onValidChange, required, hidden } = replaceOptionalButtonGroupCreationProps(props);

    const [message, setMessage, value, setValue] = createValidatedState(defVal);


    // TODO: Change label element here
    return [<>
        <InputLabel key={`${name}-label`}>{name}</InputLabel>
        <ToggleButtonGroup disabled={disabled} key={name} sx={{ flexWrap: "wrap", display: hidden ? 'none' : null }}
            value={value} exclusive onChange={onChange} aria-label={name}>
            {createToggleButtons(values, Array.isArray(names) ? names : values.map(names))}
        </ToggleButtonGroup>
    </>, message, value, setValue]
}


export function createSelect(props: ToggleButtonGroupCreationProps): InputFieldData {
    function onChange(event: SelectChangeEvent<string>) {
        let value = event.target.value;
        if (!required || (required && value)) {
            setValueValidate(value ?? '', setValue, setMessage, [ValidateApparence(values, !required)], onValidChange);
        }
    }

    function generateMenuItems() {
        return names.map((v, i) => <MenuItem key={values[i]} value={values[i]}>{names[i]}</MenuItem>);
    }

    let { name, values, defVal, disabled, names, onValidChange, required, hidden } = replaceOptionalButtonGroupCreationProps(props);

    const [message, setMessage, value, setValue] = createValidatedState(defVal);

    return [<>
        <InputLabel sx={{ display: hidden ? 'none' : null }} id={`${name}-select-label`}>{name}</InputLabel>
        <Select value={value} onChange={onChange} disabled={disabled} variant='standard'
            sx={{ display: hidden ? 'none' : null }}>
            {generateMenuItems()}
        </Select>
    </>, message, value, setValue]
}

export interface InputMetadata {
    key: string,
    create: { props: InputFieldCreationProps, type: 'text-field' } |
    { props: ToggleButtonGroupCreationProps, type: 'toggle-button-group' } |
    { props: ToggleButtonGroupCreationProps, type: 'select' } |
    { props: { hidden?: boolean, defVal: string, data: InputFieldData }, type: 'initialized' }
}

// TODO: better handle values that are shared between creation and created props
/**
 * A type to store all of the information to create an input and tie it to the search params
 */
export interface URLInputMetadata extends InputMetadata {
    filterMethod: string,
}

export interface URLInputData {
    key: string,
    filterMethod: string,
    input: InputFieldData
}

// create an input from the metadata
function createInput(inputMetadata: InputMetadata): InputFieldData {
    switch (inputMetadata.create.type) {
        case ('text-field'): {
            return createValidatedTextField(inputMetadata.create.props);
        }
        case ('toggle-button-group'): {
            return createToggleButtonGroup(inputMetadata.create.props);
        }
        case ('select'): {
            return createSelect(inputMetadata.create.props);
        }
        case ('initialized'): {
            return inputMetadata.create.props.data;
        }
    }
}

function createInputs(inputsMetadata: InputMetadata[]): [ReactElement[], string[], string[], Dispatch<SetStateAction<string>>[], boolean[]] {
    const [inputs, messages, values, setValues, hidden]: [ReactElement[], string[], string[], Dispatch<SetStateAction<string>>[], boolean[]] = [[], [], [], [], []];

    for (let inputMetadata of inputsMetadata) {
        const [input, message, value, setValue] = createInput(inputMetadata);

        inputs.push(input); messages.push(message);
        values.push(value); setValues.push(setValue);
        hidden.push(inputMetadata.create.props.hidden ?? false);
    }

    return [inputs, messages, values, setValues, hidden];
}

// TODO: maybe change this data representation
// input elements, button elements, values list
type FormData = [ReactElement[], ReactElement[], string[]];
// TODO: Validate that every key is unique; change inner data representation to a single dict
/**
 * Generate a filter form that puts all of the input values into the URL as query params
 * @param searchButtonText The text of the seach button
 * @param inputsMetadata The metadata to create the inputs for the form
 * @param searchParams The current search params of the URL
 * @param router The router
 * @param pathname The current path's name
 * @param clearButton If true, a clear button is generated with the search one
 * @param onValidSubmit Extra function to run when the form is submitted with valid input data
 * @returns The inputs, control buttons and current values of the inputs
 */
export function createURLFilterForm(searchButtonText: string, inputsMetadata: URLInputMetadata[], searchParams: URLSearchParams,
    router: AppRouterInstance, pathname: string, clearButton: boolean = false, onValidSubmit: () => void = () => { }): FormData {
    // add refreshing the page with params from form
    function addParamsToURL() {
        // udpate searchParams
        for (let i = 0; i < inputsMetadata.length; i++) {
            let inputMetadata = inputsMetadata[i];
            // only add it if the input is not hidden
            if (!inputMetadata.create.props.hidden) {
                // if the value is in the filter URL keyword
                if (inputMetadata.filterMethod != '') {
                    if (values[i] != '') {
                        searchParams = addKeyToFilterSearchParams(searchParams, inputMetadata.key, inputMetadata.filterMethod, values[i]);
                    }
                    else {
                        searchParams = removeKeyFromFilter(searchParams, inputMetadata.key);
                    }
                }
                else {
                    searchParams = updateSearchParams(searchParams, inputMetadata.key, values[i]);
                }
            }
            // remove potential hidden values from searchParams
            else {
                if (inputMetadata.filterMethod != '') {
                    searchParams = removeKeyFromFilter(searchParams, inputMetadata.key);
                }
                else {
                    searchParams = updateSearchParams(searchParams, inputMetadata.key, '');
                }
            }
        }
        // update route
        router.push(`${pathname}?${searchParams.toString()}`)
    }

    // add refreshing params with params from URL
    function onRefresh() {
        // extract and update values of the inputs
        for (let i = 0; i < inputsMetadata.length; i++) {
            let inputMetadata = inputsMetadata[i];
            // only update value if the input is not hidden
            if (!inputMetadata.create.props.hidden) {
                let value: string;
                // if the value is in the filter URL keyword
                if (inputMetadata.filterMethod != '') {
                    value = getFilterValueFromParams(searchParams, inputMetadata.key);
                }
                else {
                    value = searchParams.get(inputMetadata.key) ?? inputMetadata.create.props.defVal ?? '';
                }
                if (value != values[i]) {
                    setValues[i](value);
                }
            }
        }
    }
    // clear form
    function onClear() {
        // extract all of the values and update the URLs
        for (let i = 0; i < inputsMetadata.length; i++) {
            let inputMetadata = inputsMetadata[i];
            let defVal = inputMetadata.create.props.defVal || '';
            // if the value is in the filter URL keyword
            if (inputMetadata.filterMethod != '') {
                if (defVal != '') {
                    searchParams = addKeyToFilterSearchParams(searchParams, inputMetadata.key, inputMetadata.filterMethod, defVal);
                }
                else {
                    searchParams = removeKeyFromFilter(searchParams, inputMetadata.key);
                }
            }
            else {
                searchParams = updateSearchParams(searchParams, inputMetadata.key, defVal);
            }
        }
        // update route
        router.push(`${pathname}?${searchParams.toString()}`)
    }
    // on submit
    function onSubmit() {
        if (valid) {
            addParamsToURL();
            onValidSubmit();
        }
    }

    // create the inputs
    const [inputs, messages, values, setValues, hidden] = createInputs(inputsMetadata);

    let valid = isFormValid(messages, hidden);
    let buttons = [<Button disabled={!valid} onClick={valid ? onSubmit : undefined}>{searchButtonText}</Button>];
    if (clearButton) {
        buttons.unshift(<Button onClick={onClear}>Clear</Button>);
    }

    useEffect(() => onRefresh, [searchParams]);
    // create the button
    return [inputs, buttons, values]
}


/**
 * A function to create a form consisting of TextFields generated by createValidatedTextField
 * @param validatorParams The parameters for createValidatedTextField for each text field that is to be created
 * @param submitDisabled Whether the submit button is disabled
 * @param buttonText The text on the button
 * @param onSubmit A function that takes the messages and current values of the form and does something when the button is clicked
 * @returns A list of elements, where the first one is the form created, elements enclosed in a fragment, the second is the messages of the TextFields and the third is the values of the TextFields
 */
export function createForm(searchButtonText: string, inputsMetadata: InputMetadata[], onSubmit?: (values: string[]) => void): FormData {
    // create the inputs
    const [inputs, messages, values, setValues, hidden] = createInputs(inputsMetadata);

    let valid = isFormValid(messages, hidden);
    let buttons = [<Button disabled={!valid} onClick={valid && onSubmit ? () => { onSubmit(values) } : undefined}>{searchButtonText}</Button>];
    return [inputs, buttons, values]
}

export function createLink(text: ReactNode, href: string, className: string = '', targetBlank: boolean = true) {
    return <Link sx={{ width: 'fit-content' }} underline='hover' target={targetBlank ? '_blank' : '_self'} rel="noopener"
        className={className} href={href}>{text}</Link>
}

export function createSmallTitle(text: ReactNode, className: string = '') {
    return <div className={`text-xl ${className}`}>{text}</div>;
}

export function createMediumTitle(text: ReactNode, className: string = '') {
    return <div className={`text-2xl ${className}`}>{text}</div>;
}

export function createLargeTitle(text: ReactNode, className: string = '') {
    return <div className={`text-3xl ${className}`}>{text}</div>;
}

// TODO: Debounce this
// export function createValidatedURLInput(label: string, defVal: string, validators: TextFieldValidator[],
//     key: string, params: URLSearchParams, router: AppRouterInstance, pathname: string, filterMethod: string = ''): [ReactElement, string, string, Dispatch<SetStateAction<string>>] {
//     function updateURLParams(value: string) {
//         if (filterMethod != '') {
//             params = addKeyToFilterSearchParams(params, key, filterMethod, value);
//         }
//         else {
//             params = updateSearchParams(params, key, value);
//         }

//         router.push(`${pathname}?${params.toString()}`);
//     }

//     // get the value from the URL if possible
//     let urlVal = params.get(key) ?? '';

//     const [field, message, value, setValue] = createValidatedTextField(label, defVal, validators, updateURLParams);

//     // if the value of the URL is different than the current value set it properly
//     if (filterMethod != '') {
//         let filterValue = getFilterValue(params.get('filter') ?? '', key);
//         if (filterValue != value) {
//             setValue(filterValue);
//         }
//     }
//     else {
//         if (urlVal != value) {
//             setValue(urlVal);
//         }
//     }


//     return [field, message, value, setValue];
// }