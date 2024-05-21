import axios from "axios";
import React from "react";


export default({url, method, body, onSuccess}) => {
    // method == 'post' or 'get' or 'put' etc. 
    const [errors, setErrors] =  useState(null);
    function doRequest () {
        try {
            const respone = await axios[method](url, body);
            if (onSuccess) {
                onSuccess(response.data);
            }
            return response.data;
        } catch (err) {
            setErrors(
                <div className="alert alert-danger">
                    <h4>Oops...</h4> 
                    <ul className="my-0">
                        {err.respone.data.errors.map(err => <li>err.message</li>)}
                    </ul>
                </div>
            );
            throw err;
        }
    }
    return {doRequest, errors};
};