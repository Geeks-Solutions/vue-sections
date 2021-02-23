# Sections

Sections is an efficient serverless app relying on modern technologies to increase page render speed and facilitate the work of frontend developers. This package provide a VueJS Component to use right off the bat to interface with Sections' server

In order to benefit from this service you should register for free on the following [link](https://sections.geeks.solutions/register)

# Vue Sections

Is a vue.js 2 wrapper for sections.

# Get started

Make sure to have your projectID, then install the library on your project

```npm
npm install vue-sections@1.0.0
```

Configure the library with your ProjectID

```
{From Jad}
```

Then add the sections component on the page(s) of your choice

```
   <template>
        <div id="app">
            <Sections
            :admin="admin"
            :pageName="page_name"
            :variations="[]"
            />
        </div>
    </template>

    <script>
        import { Sections } from "vue-sections";
        export default {
            name: "App",
            components: {
                Sections,
            },
            data() {
                return {
                    admin: false,
                    pageName: "Home page"
                };
            },
            created() {
                this.admin = this.$cookies.get("sections-auth-token") ? "true" : false;
            },
        };

    </script>
```

Here we load props from data on the page, the admin prop is used to indicate if the edit interface for the page should display or not. Sections uses a cookie to store a user token to secure communications for page editing actions, if the cookie is found it assumes the edit button should show. for more information check the [docs](https://sections.geeks.solutions/docs/frontend/index.html)

To get the UserToken you can use our special component {provided by Jad} in any page of your choice and configure the login redirect URL on your Sections Project configuration, then press the button from there to connect your website. The special component will take care of fetching the UserToken from sections from you.

You want to move on and start providing local and static sections for your website editor ? Read below

# How it works

Sections comes with a Wysiwyg and any public sections out of the box that you can use right away.

You can of course define your own local and static section types and you have the ability to control the way any section will display on your website.

You do this by creating custom VueJS components and placing them in folders that you then indicate to sections.

You need to set the vue-sections variable `path` and vue-sections will try scan this folder to load your components. for instance if you set `path: "@/configs"` make sure that the `configs` directory follows the following structure:

```
src
|_ configs
    |_ views
       |_ your_component.vue
    |_ type-icons
       |_ your_component.vue
    |_ forms
       |_ your_component.vue
```

- `views` folder will contain the design of your component that will be render on the page for your visitors (and during preview)
- `type-icons` folder will contain the icons that will illustrate your section in the add a new section box.
- `forms` is the folder where you create the form that will help you to fill the data while adding or editing `your-component` to your page. This is only for static section types, local and dynamic ones persist no data and configurable ones have their data entry form automatically built by the library as this comes from the third party developer providing this section.

---

## For Contributors

If you wish to contribute to this project, head to this [wiki](https://github.com/Geeks-Solutions/vue-sections/wiki) and follow the instructions there.
