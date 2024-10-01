
interface Item {
  text: string;
  link: string;
}

export const findObjectByLink = (options: any, link: string): Item | null => {
  for (const option of options) {
    if (option.link === link) {
      return option;
    }

    if (option.children) {
      const result = findObjectByLink(option.children, link);
      if (result) {
        return result;
      }
    }
  }

  return null;
};

export function findObjectPolicyByLink(link: string) {
  let result = "";
  switch (link) {
    case "/dashboard/task/production/policy/fire":
      result = "Policy";
      break;
    case "/dashboard/task/production/policy/marine":
      result = "Policy";
      break;
    case "/dashboard/task/production/policy/bonds":
      result = "Policy";
      break;
    case "/dashboard/task/production/policy/mspr":
      result = "Policy";
      break;
    case "/dashboard/task/production/policy/pa":
      result = "Policy";
      break;
    case "/dashboard/task/production/policy/cgl":
      result = "Policy";
      break;
    case "/dashboard/task/production/policy/vehicle/policy-type-details":
      result = "Policy";
      break;
    case "/dashboard/task/production/policy/vehicle/policy-premium":
      result = "Policy";
      break;
    case "/dashboard/task/production/policy/fire/policy-premium":
      result = "Policy";
      break;
    case "/dashboard/task/production/policy/marine/policy-type-details":
      result = "Policy";
      break;
    case "/dashboard/task/production/policy/marine/policy-premium":
      result = "Policy";
      break;
    case "/dashboard/task/production/policy/bonds/policy-type-details":
      result = "Policy";
      break;
    case "/dashboard/task/production/policy/bonds/policy-premium":
      result = "Policy";
      break;
    case "/dashboard/task/production/policy/mspr/policy-type-details":
      result = "Policy";
      break;
    case "/dashboard/task/production/policy/mspr/policy-premium":
      result = "Policy";
      break;
    default:
      result = "Dashboard";
  }
  return result;
}
export const policyLinkList = [
  "/dashboard/task/production/policy/",
  "/dashboard/task/production/policy/marine",
  "/dashboard/task/production/policy/bonds",
  "/dashboard/task/production/policy/mspr",
  "/dashboard/task/production/policy/pa",
  "/dashboard/task/production/policy/cgl",
  "/dashboard/task/production/policy/fire",
  "/dashboard/task/production/policy/vehicle/policy-type-details",
  "/dashboard/task/production/policy/vehicle/policy-premium",
  "/dashboard/task/production/policy/fire/policy-premium",
  "/dashboard/task/production/policy/marine/policy-type-details",
  "/dashboard/task/production/policy/marine/policy-premium",
  "/dashboard/task/production/policy/bonds/policy-type-details",
  "/dashboard/task/production/policy/bonds/policy-premium",
  "/dashboard/task/production/policy/mspr/policy-type-details",
  "/dashboard/task/production/policy/mspr/policy-premium"
];
