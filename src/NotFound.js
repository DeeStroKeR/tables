import React from 'react';
import { useHistory } from "react-router";

export default function NotFound () {
    const history = useHistory();
    return (
        <div>
            <p>page not found</p>
            <button onClick={() => history.push('/')}>G to main page</button>
        </div>
    )
}
