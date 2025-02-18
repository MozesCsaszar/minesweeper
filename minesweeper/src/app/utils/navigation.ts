import { ReadonlyURLSearchParams } from 'next/navigation';

// TODO: Name these suggestively

type FilterObject = { [key: string]: { method: string, value: string } };

/**
 * Separate the filter query parameter into key, method value data
 * @param filter The filter string, in the form [key1,method1,val1{,key2,method2,val2{,...}}]
 * @returns An object that has the key, method and value information
 */
export function separateFilter(filter: string): FilterObject {
    let separated: FilterObject = {};

    if (filter != '') {
        let filterArray: string[] = filter.substring(1, filter.length - 1).split(',');
        for (let i = 0; i < filterArray.length; i += 3) {
            if (i + 2 < filterArray.length) {
                separated[filterArray[i]] = { method: filterArray[i + 1], value: filterArray[i + 2] }
            }
        }
    }

    return separated;
}

/**
 * Join the filters form a list of FilterObjects into a single FilterObject
 * @param filters The FilterObjects to join
 * @returns The joined FilterObject
 */
function joinFilter(filters: FilterObject[]): FilterObject {
    let newFilter: FilterObject = {};

    for (let filter of filters) {
        for (let key in filter) {
            newFilter[key] = { method: filter[key].method, value: filter[key].value };
        }
    }

    return newFilter;
}

/**
 * Convert a FilterObject into a string of the correct format
 * @param filter The FilterObject to join
 * @returns The filter string
 */
function filterToString(filter: FilterObject): string {
    let filterStr: string[] = [];
    for (let key in filter) {
        filterStr.push(`${key},${filter[key].method},${filter[key].value}`);
    }

    return `[${filterStr.join(',')}]`
}

/**
 * Extract the value of a filter element from a filter string
 * @param filter The filter string in the [key1,method1,val1{,key2,method2,val2{,...}}] format
 * @param key The key to search for
 * @returns The value at the filter or '' if value was not found
 */
export function getFilterValueFromString(filter: string, key: string): string {
    return separateFilter(filter)[key]?.value || '';
}

/**
 * Extract the value of a filter element from the SearchParams
 * @param params The current SearchParams
 * @param key The key to search for
 * @returns The value at the filter or '' if value was not found
 */
export function getFilterValueFromParams(params: URLSearchParams, key: string): string {
    return separateFilter(params.get('filter') || '')[key]?.value || '';
}

/**
 * Add a key with a method and value to the filter in query params
 * @param params The current SearchParams
 * @param key The key of the filter
 * @param method The method of the filter
 * @param value The value of the filter
 * @returns The new SearchParams
 */
export function addKeyToFilterSearchParams(params: URLSearchParams | ReadonlyURLSearchParams, key: string, method: string, value: string): URLSearchParams {
    return addFilterToSearchParams(params, `[${key},${method},${value}]`)
}

/**
 * Add a filter string to the SearchParams
 * @param params The current SearchParams
 * @param value The value of the filter in the form [key1,method1,val1{,key2,method2,val2{,...}}]
 * @returns The new SearchParams
 */
export function addFilterToSearchParams(params: URLSearchParams | ReadonlyURLSearchParams, value: string): URLSearchParams {
    let newParams = new URLSearchParams(params);
    let filter = params.get('filter') ?? '';
    let finalFilter: FilterObject;

    if (filter != '') {
        let oldFilter = separateFilter(filter);
        let newFilter = separateFilter(value);
        finalFilter = joinFilter([oldFilter, newFilter]);
    }
    else {
        finalFilter = separateFilter(value);
    }

    newParams.set('filter', filterToString(finalFilter));

    return newParams;
}

/**
 * Remove a key from the filter from the SearchParams
 * @param params The current SearchParams
 * @param key The key to remove from filters
 * @returns The new SearchParams
 */
export function removeKeyFromFilter(params: URLSearchParams | ReadonlyURLSearchParams, key: string) {
    let newParams = new URLSearchParams(params);

    let filter = params.get('filter') ?? '';
    let filterObj = separateFilter(filter);
    if (filterObj[key]) {
        delete filterObj[key];
    }

    newParams.set('filter', filterToString(filterObj));

    return newParams;
}

/**
 * Update the search params with a new query parameter; if value == '', remove the key, else add or update it
 * @param params The current SearchParams
 * @param key The key of the new query parameter
 * @param value The value of the query paramater
 * @returns The new SearchParams
 */
export function updateSearchParams(params: URLSearchParams | ReadonlyURLSearchParams, key: string, value: string) {
    let newParams = new URLSearchParams(params);

    if (value) {
        newParams.set(key, value);
    }
    else {
        newParams.delete(key);
    }

    return newParams;
}