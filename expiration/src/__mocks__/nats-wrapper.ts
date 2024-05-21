
//This is a mock implementation of the nats wrapper. 
//The router handlers don't use connect() function and _client property. 
//So, we only implement client property in the mock implementation 
export const natsWrapper = {
    client: {
        publish: jest.fn().mockImplementation(
            (subject: string, data: string, callback: () => void) => {
                    callback();
                }
        )
        
        // publish: (subject: string, data: string, callback: () => void) => {
        //     callback();
        // }
    }
};