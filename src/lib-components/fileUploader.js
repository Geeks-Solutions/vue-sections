import axios from "axios";
import {sectionHeader} from "@/base/helpers";

export async function globalFileUpload(file, oldMediaID) {
    if(oldMediaID) {
        try {
            await deleteMedia(oldMediaID)
        } catch (e) {
            return {data: '', success: false, error: e}
        }
    }
    const token = window.$nuxt.$cookies.get("sections-auth-token")
    const data = new FormData()
    data.append('files[1][file]', file)
    data.append('type', "image")
    data.append('author', "Author")
    data.append('private_status', "public")
    data.append('files[1][platform_id]', '1')
    try {
        const config = {
            headers: sectionHeader({ token }),
        };
        const result = await axios.post(
            window.$nuxt.$sections.serverUrl +
            `/project/${window.$nuxt.$sections.projectId}/media`,
            data,
            config
        )
        return {data: result.data, success: true, error: ''}
    } catch (e) {
        return {data: '', success: false, error: e}
    }
}

export async function deleteMedia(id) {
    const token = window.$nuxt.$cookies.get("sections-auth-token")
    try {
        const config = {
            headers: sectionHeader({ token }),
        };
        const result = await axios.delete(window.$nuxt.$sections.serverUrl + `/project/${window.$nuxt.$sections.projectId}/media/${id}`,
            config
        )
        return {data: result.data, success: true, error: ''}
    } catch (e) {
        return {data: '', success: false, error: e}
    }
}