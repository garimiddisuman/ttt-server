const setupPlayername = async () => {
  const response = await fetch("/playername");
  const { playername } = await response.json();
  const greeting = document.querySelector("#greeting");
  greeting.textContent = `Hi ${playername} !`;
};

const findMatch = async () => {
  const response = await fetch("/findMatch");
  return await response.json();
};

const sendRequest = () => {
  const timeoutId = setTimeout(async () => {
    const { isMatchFound } = await findMatch();

    if (isMatchFound) {
      clearInterval(timeoutId);
      globalThis.location = "/game";
      return;
    }

    return sendRequest();
  }, 1000);
};

const main = async () => {
  await setupPlayername();
  sendRequest();
};

globalThis.onload = main;
