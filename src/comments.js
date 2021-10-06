import React, { useEffect, useState, useContext } from 'react';
import { useLocation } from "react-router-dom";
import { useHistory } from "react-router";
import { Context, SET_COMMENTS, CLEAR_COMMENTS } from './App';


export default function comments() {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const id = params.get("id");
    const history = useHistory();
    const [isLoading, setIsloading] = useState(false);
    const context = useContext(Context);
    const [error, setError] = useState();

    const { comments } = context.state;

    useEffect(async () => {
        console.log('entered')
        if (!id) {
            history.push('/');
            return;
        }
        setIsloading(true);
        context.dispatch({
            type: CLEAR_COMMENTS,
        })
        const url = "https://api.hnpwa.com/v0/item/"
        await fetch(`${url}${id}.json`)
            .then(res => res.json())
            .then(
                (result) => {
                    context.dispatch({
                        type: SET_COMMENTS,
                        payload: result
                    })
                    console.log('res', result)
                    setIsloading(false);
                },
                (error) => {
                    setError(error)
                }
            )
    }, [id]);

    let result = [];

    if (comments.length) {
        flatComments(comments)

        function flatComments (arr) {
            arr.forEach(element => {
                if (element.comments) {
                    result = [...result, element]
                    flatComments(element.comments)
                }
            });
            return result;
        }
    }

    return (
        <div>
            <button className="to-top-button go-back" onClick={() => history.push('/')}>Go Back</button>
            {isLoading && <p>Loading.....</p>}
            {!isLoading && !result.length && <p>No comments yet</p>}
            {!isLoading && error && <p>{error}</p>}
            {result?.map((comments) => {
                return (
                    <React.Fragment key={comments.id}>
                        <h1>{comments.user} {comments.time_ago}</h1>
                        <div dangerouslySetInnerHTML={{__html: comments.content}}></div>
                    </React.Fragment>
                )
            })}
        </div>
    )
}
