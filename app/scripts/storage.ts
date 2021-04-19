import { StorageArea } from '@spadin/webextension-storage';

import { useCallback, useEffect, useState } from 'react';

import { IStorageAccessor, StorageListener } from '@spadin/webextension-storage';


export interface OptionItems {
    subdomain: string;      // General settings
    apiStudentUUID: string;
    defaultSearch:string;
    adminMode: boolean;
    almaStart: boolean;
    debug: boolean;

    displayChat: boolean;   // Other
    stayAlive: boolean;
    reportCardRevisions: boolean;
    reportCardRevisionColor: string;

    reportingComplianceTab: boolean; // Reports
    reportingTranscriptsTab: boolean;

    attendanceIgnoreClasses:Array<string>;  //
    
    htmlMessaging: boolean; // Messaging
    signature: string;
    
    almaStartPDFButtons: boolean;           // Alma Start
    almaStartIgnoreEnrolled: boolean;
    almaStartIgnoreApplicants: boolean;
    almaStartBrowserNotifications: boolean;
    almaStartEmailNotifications: boolean;
    almaStartIncludeNotesInSearch: boolean;
    almaStartNewNoteTemplate: string;
    almaStartFileNaming: string;
    
    googleApiCredentials: string;   // Google API
    googleApiAccount: string;
    sheetId: string;

    userUUID: string;   // Hidden
    
}

export var options = StorageArea.create<OptionItems>({
    defaults: {
        subdomain: 'sges',
        apiStudentUUID: '5d67e14d70a9a1462f24cdc3',
        displayChat: false,
        signature: '',
        htmlMessaging: true,
        almaStart: false,
        almaStartPDFButtons: true,
        almaStartIgnoreEnrolled: false,
        almaStartIgnoreApplicants: false,
        almaStartBrowserNotifications: true,
        almaStartEmailNotifications: false,
        almaStartIncludeNotesInSearch: false,
        almaStartNewNoteTemplate: '',
        almaStartFileNaming: 'name-process',
        reportingComplianceTab: false,
        reportingTranscriptsTab: true,
        stayAlive: false,
        googleApiCredentials: '',
        googleApiAccount: '',
        sheetId: '',
        defaultSearch: 'search',
        attendanceIgnoreClasses: [],
        userUUID: '',
        debug: false,
        adminMode: false,
        reportCardRevisions: false,
        reportCardRevisionColor: 'purple'
    },
    storageArea: 'sync'
});

export interface SearchDocuments {
    startStudents: Array<Object>;
    startNotifications: Array<Object>;
    gradeLevels: Array<Object>;
    messages: Array<Object>;
    notes: Array<Object>;
};

export var searchData = StorageArea.create<SearchDocuments>({
    defaults: {
        startStudents: [{}],
        startNotifications: [{}],
        gradeLevels: [{}],
        messages: [{}],
        notes: [],

    },
    storageArea: 'local'
});


export interface WatcherDocuments {
    notesWatcher: boolean;
    
};

export var watchers = StorageArea.create<WatcherDocuments>({
    defaults: {
        notesWatcher: false,
        
    },
    storageArea: 'local'
});


/**
 * Gets an ID that is unique to an input field.
 */
export function inputId(accessor: IStorageAccessor<any>) {
    return `options-input-${accessor.key}`;
}

export type UseStoreResult<T> = [T, (value: T) => Promise<void>];

/**
 * Returns the current value for a setting in extension storage, and a function to update it.
 * @param accessor Accessor for the setting.
 * @param defaultValue Default value to use until the setting has been loaded.
 */
export function useStore<T>(accessor: IStorageAccessor<T>, defaultValue: T): UseStoreResult<T> {
    const [value, setValue] = useState<T>(defaultValue);

    useStoreGet(accessor, setValue);
    useStoreChanged(accessor, (change) => {
        if (change.newValue !== undefined) {
            setValue(change.newValue);
        }
    });

    return [value, useStoreSet(accessor)];
}

/**
 * Registers a function to be called when a setting in extension storage changes.
 * @param accessor Accessor for the setting to listen to.
 * @param callback Function to call when the value changes.
 */
export function useStoreChanged<T>(accessor: IStorageAccessor<T>, callback: StorageListener<T>) {
    useEffect(() => {
        // init
        accessor.addListener(callback);

        // cleanup
        return () => {
            accessor.removeListener(callback);
        };
    }, [accessor]);
}

/**
 * Gets the current value of a setting in extension storage and calls a callback with it when done.
 * @param accessor Accessor for the setting to get.
 * @param callback Function to call with the value as the first argument.
 */
export function useStoreGet<T>(accessor: IStorageAccessor<T>, callback: (value: T) => void) {
    async function getValue() {
        callback(await accessor.get());
    }

    useEffect(() => {
        getValue();
    }, [accessor]);
}

/**
 * Returns a function to update the value of a setting in extension storage.
 * @param accessor Accessor for the setting to set.
 */
export function useStoreSet<T>(accessor: IStorageAccessor<T>) {
    return useCallback(
        async (value: T) => await accessor.set(value),
        [accessor]);
}
