import { useState } from "react";
import useRequest from "../../hooks/use-request";
import Router from 'next/Router';

export default () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const {doRequest, errors} = useRequest({url: '/api/users/signup', 
        method: 'post', 
        body: {email, password},
        onSuccess: () => Router.push('/')} );

    const onSubmit = async (event) => {
        event.preventDefault();
        doRequest();

        //if the request is not successful, then doRequest function throws an error. 
        //So, routing to "/" page only happens when doRequest is successful. 
        // Router.push('/');
        
        // try {
        //     const response = await axios.post('/api/users/signup', {
        //         email, password
        //     });
        //     console.log(response.data);
        // } catch(err) {
        //     console.log(err.response.data);
        //     setErrors(err.response.data.errors);
        // }
    }
    
    return (<form>
        <h1>Signup</h1>
        <div className="form-group">
            <label>Email address</label>
            <input value={email} 
                onChange = {e => setEmail(e.target.value)} 
                className="form-control" />
        </div>
        <div className="form-group">
            <label>Password</label>
            <input type="password" 
                value = {password}
                onChange = {e => setPassword(e.target.value)} 
                className="form-control" />
        </div>
        <button type="submit" className="btn btn-primary" onSubmit={onSubmit}>Sign up</button>
        
        {errors.length > 0 && errors}       
    </form>);
}