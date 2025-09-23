// Put stuff for Alias and Password Here

// Stuff about passing in doLogin or doRegister is talked abut in 1:02

interface Props {
  alias: string;
  setAlias: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  enterFunction: () => void;
}

const AuthenticationFields = (props: Props) => {
  const checkSubmitButtonStatus = (): boolean => {
    return !props.alias || !props.password;
  };

  const submitOnEnter = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key == "Enter" && !checkSubmitButtonStatus()) {
      {
        props.enterFunction;
      }
    }
  };

  return (
    <>
      <div className="form-floating">
        <input
          type="text"
          className="form-control"
          size={50}
          id="aliasInput"
          placeholder="name@example.com"
          onKeyDown={submitOnEnter}
          onChange={(event) => props.setAlias(event.target.value)}
        />
        <label htmlFor="aliasInput">Alias</label>
      </div>
      <div className="form-floating mb-3">
        <input
          type="password"
          className="form-control bottom"
          id="passwordInput"
          placeholder="Password"
          onKeyDown={submitOnEnter}
          onChange={(event) => props.setPassword(event.target.value)}
        />
        <label htmlFor="passwordInput">Password</label>
      </div>
    </>
  );
};

export default AuthenticationFields;
