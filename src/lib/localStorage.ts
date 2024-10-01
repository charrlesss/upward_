export default function storedLocalStorage(obj: any, storageName: string) {
  const initialStateJSON = JSON.stringify(obj);
  const storedInitialStateJSON = localStorage.getItem(storageName);

  const initialStateStored = storedInitialStateJSON
    ? storedInitialStateJSON
    : initialStateJSON;
  localStorage.setItem(storageName, initialStateStored);

  const listStorageName = [
    "VPolicyInitialState",
    "BPolicyInitialState",
    "FPolicyInitialState",
    "MPolicyInitialState",
    "MSPRPolicyInitialState",
    "PAPolicyInitialState",
    "CGLPolicyInitialState",
  ];
  listStorageName.forEach((names: string) => {
    if (names !== storageName) {
      localStorage.removeItem(names);
    }
  });

  return (localStorage.getItem(storageName) as string)
    ? JSON.parse(localStorage.getItem(storageName) as string)
    : obj;
}
