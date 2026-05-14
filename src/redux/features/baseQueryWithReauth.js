import { fetchBaseQuery } from "@reduxjs/toolkit/query";
import {setCredentials,logout} from "./auth/authSlice"
const baseQuery=fetchBaseQuery({
    baseUrl:"http://localhost:5555/api",
    prepareHeaders:(headers,{getState})=>{
        const token=getState().auth.accessToken
        if(token){
            headers.set("Authorization",`Bearer ${token}`)
        }
        return headers
    }
})
export const baseQueryWithReauth=async(args,api,extraOptions)=>{
    let result=await baseQuery(args,api,extraOptions)
    if(result?.error?.status==401){
        const refreshToken=api.getState().refreshToken
        if (!refreshToken){
            api.dispatch(logout())
            return result
        }
        const refreshResult=await baseQuery(
            {
                url:"/Auth/refresh",
                method:"POST",
                body:{refreshToken}
            },
            api,
            extraOptions
        )
        if (refreshResult?.data) {
          api.dispatch(setCredentials(refreshResult.data));
          result = await baseQuery(args, api, extraOptions);
        } else {
          api.dispatch(logout());
        }
    }

    return result
}