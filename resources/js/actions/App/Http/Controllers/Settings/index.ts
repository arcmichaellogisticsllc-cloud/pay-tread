import PasswordController from './PasswordController'
import TwoFactorSettingsController from './TwoFactorSettingsController'

const Settings = {
    PasswordController: Object.assign(PasswordController, PasswordController),
    TwoFactorSettingsController: Object.assign(TwoFactorSettingsController, TwoFactorSettingsController),
}

export default Settings