import ProfileController from './ProfileController'
import Settings from './Settings'

const Controllers = {
    ProfileController: Object.assign(ProfileController, ProfileController),
    Settings: Object.assign(Settings, Settings),
}

export default Controllers