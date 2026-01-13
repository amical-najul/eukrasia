import { GoogleLogin } from '@react-oauth/google';

const GoogleLoginButton = ({ onSuccess, onError }) => {
    const handleSuccess = (credentialResponse) => {
        // credentialResponse.credential contains the ID Token (JWT)
        if (onSuccess) {
            onSuccess({ credential: credentialResponse.credential });
        }
    };

    const handleError = () => {
        if (onError) {
            onError({ error: 'Google login failed' });
        }
    };

    return (
        <div className="w-full">
            <GoogleLogin
                onSuccess={handleSuccess}
                onError={handleError}
                useOneTap={false}
                theme="outline"
                size="large"
                width="100%"
                text="continue_with"
            />
        </div>
    );
};

export default GoogleLoginButton;
