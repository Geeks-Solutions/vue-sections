# Sections

Sections is an efficient serverless app relying on modern technologies to increase page render speed and facilitate the work of frontend developers. This package provide an VueJS Component to use right off the bat to interface with Sections' server

In order to get benift of this service you should register on the following [link](https://sections-saas.k8s-dev.geeks.solutions/register)

# Vue Sections

Is a vue.js 2 wrapper for sections.

# Get started

```npm
npm install vue-section@1.0.0
```

# How it works

You need to set the vue-section variable `path: "@/../src/configs"` and here where vue-sections will try to load the `views` make sure that the `configs` directory follows the following structure:

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

- `views` folder will contain the design of your component that will be render on the page
- `type-icons` folder it will contain the icons that will differentiate between the icons when you will add a new section to your page
- `forms` is the folder where you create the form that will help you to fill the data while adding `your-component` to your page.

## For Developers

---

# vue-sections

1. Please fork the project
2. `npm install` to install node modules
3. `npm run build` to build the library using rollup
4. If you want to test your changes locally you can run: `npm run serve`

# Setting up a new project

To test the library you should create a new vue project and set it up:

1. `vue.config.js:`
   ```
   module.exports = {
       devServer: {
           host: 'pigrofelice.k8s-dev.geeks.solution',
           https: true
       },
       chainWebpack: config => config.resolve.symlinks(false)
   };
   ```
2. `.env`
   ```
   VUE_APP_RELATIVE_CONFIG_PATH=@/../src/configs
   ```
3. `package.json`
   ```
   dependencies:{
       "vue-sections": "file:{path_of_your_vue_section_project}"
   }
   ```
   Note: Make sure to run the following command after this adjustment `npm install vue-sections`
4. `App.vue`

   ```
   <template>
        <div id="app">
            <Sections
            :admin="true"
            :pageName="page_name"
            :variations="[]"
            :project_id="your_project_id"
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
        };
    </script>
   ```

5. `config` this folder is found on gitlab wiki page please download it or create your own components.
