export interface Operation {
    id: String;
    procedure: string;
    duration: number;
    description: string;
    events: OperationEvent[];
}

export interface OperationEvent {
    eventId: string;
    timestamp: string;
    type: string;
    eventName: string;
    description?: string;
    image?: string;
};