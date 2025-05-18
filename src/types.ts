export interface Operation {
    id: string;
    procedure: string;
    duration: number;
    starttime: string;
    endtime: string;
    skintoskintime: number;
    description: string;
    events: OperationEvent[];
}

export interface User {
    id: string;
    name: string;
    birthdate: string;
    cases: Array<string>;
}

export interface OperationEvent {
    eventId: string;
    timestamp: string;
    type: string;
    eventName: string;
    description?: string;
    image?: string;
    video?: string;
    forceaverage?: number;
};