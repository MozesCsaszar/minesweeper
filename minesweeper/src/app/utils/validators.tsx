/**
 * The type for a function that validates the value of a text field.
 * These functions should return '' if the value is valid, a string message otherwise
 */
export type InputValidator = (value: string) => string;

/**
 * Validate whether a field is an integer number.
 * @param value the value to be validated
 * @returns '' or string message
 */
export const ValidateNumber: InputValidator = (value: string): string => {
    return /^\d+$/.test(value) ? '' : 'The provided number must be an integer.';
}

/**
 * Create a validator function to see whether a string value is a number and >= than the minValue
 * @param minValue the minValue accepted by the validator
 * @returns TextFieldValidator function
 */
export const ValidateMinValue = (minValue: number): InputValidator => {
    return (value: string) => (ValidateNumber(value) == '' && Number(value) >= minValue) ? '' : `The provided number must be an integer greater than or equal to ${minValue}.`;
}


/**
 * Create a validator function to see whether a string value is a number and <= than the maxValue
 * @param maxValue the maxValue accepted by the validator
 * @returns TextFieldValidator function
 */
export const ValidateMaxValue = (maxValue: number): InputValidator => {
    return (value: string) => (ValidateNumber(value) == '' && Number(value) <= maxValue) ? '' : `The provided number must be an integer less than or equal to ${maxValue}.`;
}


/**
 * Create a validator function to see whether a string value is has length >= than the minLength
 * @param minLength the minLength accepted by the validator
 * @returns TextFieldValidator function
 */
export const ValidateMinLength = (minLength: number): InputValidator => {
    return (value: string) => value.length >= minLength ? '' : `The string provided must be longer than or equal to ${minLength} characters in length.`;
}


/**
 * Create a validator function to see whether a string value is has length <= than the maxLength
 * @param maxLength the maxLength accepted by the validator
 * @returns TextFieldValidator function
 */
export const ValidateMaxLength = (maxLength: number): InputValidator => {
    return (value: string) => value.length <= maxLength ? '' : `The string provided must be shorter than or equal to ${maxLength} characters in length.`;
}

export const ValidateApparence = (values: string[], canBeEmpty: boolean = false): InputValidator => {
    return (value: string) => values.find((v) => value == v) || (canBeEmpty && value == '') != undefined ? '' : `The value '${value}' is not a valid option.`
}