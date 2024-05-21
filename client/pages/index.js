function LandingPage ({color}) {
    return <h1>Landing age</h1>
}

//This function is executed on the server
LandingPage.getInitialProps = () => {
    console.log("I am on the server!");
    return {color: 'red'};
}

export default LandingPage;
