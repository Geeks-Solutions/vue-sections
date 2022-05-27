import axios from "axios";
import {sectionHeader} from "@/base/helpers";

export async function addNewStaticType(sectionTypeName) {
    if (sectionTypeName !== "") {
        const token = window.$nuxt.$cookies.get("sections-auth-token");
        const config = {
            headers: sectionHeader({
                token
            })
        };
        const URL = window.$nuxt.$sections.serverUrl + `/project/${window.$nuxt.$sections.projectId}/section-types/${sectionTypeName}`;
        try {
            await axios.post(URL, {}, config)
            return  {
                status: 'success'
            };
        } catch (error) {
            return {
                status: 'error',
                message: "Couldn't create the new section type: " + error.response.data.message
            };
        }
    }
}