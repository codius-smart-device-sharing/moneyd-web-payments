import * as React from 'react';

export class App extends React.Component<{}, {}>
{
    constructor(props: any)
    {
        super(props);
    }

    public render(): React.ReactNode
    {
        return (
            <div className="page-container">
                <h1> Connected... </h1>
                <h1> Public at </h1>
            </div>
        );
    }
}