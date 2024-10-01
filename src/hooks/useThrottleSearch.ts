import { throttle } from 'lodash';

 const useThrottleSearch =(getInputSearch:(input:string)=>void)=> {

    const throttledSearch = throttle((input) => {
        getInputSearch(input);
    }, 2000); 

  return {
    throttledSearch
  }
}
export default useThrottleSearch
