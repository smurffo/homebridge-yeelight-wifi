/** Support for "moonlight" mode for ceiling lamps
 * active_mode:
 *  0 - Daylight mode |
 *  1 - Moonlight mode
 */
const MoonlightMode = Device =>
  class extends Device {
    constructor(props, platform) {
      super(props, platform);
      const { bright, active_mode } = props;
      this.bright = bright;
      this.activeMode = Number(active_mode) || 0;

      this.moonlightModeService =
        this.accessory.getService(global.Service.Switch) ||
        this.accessory.addService(new global.Service.Switch(`Moonlight Mode`));

      this.moonlightModeService
        .getCharacteristic(global.Characteristic.On)
        .on('set', async (value, callback) => {
          try {
            await this.setMoonlightMode(value);
            callback(null);
          } catch (err) {
            callback(err);
          }
        })
        .on('get', async callback => {
          try {
            const [value] = await this.getProperty(['active_mode']);
            this.activeMode = Number(value);
            callback(null, this.activeMode);
          } catch (err) {
            callback(err, this.activeMode);
          }
        })
        .updateValue(this.activeMode);
    }

    async setMoonlightMode(state) {
      const { brightness: transition = 400 } = this.config.transitions || {};
      this.log.debug(
        `Setting ${state ? '🌙' : '☀️'} mode on device ${this.did}`
      );
      await this.sendCmd({
        method: 'set_power',
        params: ['On', 'smooth', transition, state ? 5 : 1],
      });
      this.activeMode = state ? 1 : 0;
    }

    updateStateFromProp(prop, value) {
      if (prop === 'active_mode') {
        this.activeMode = value;
        this.moonlightModeService
          .getCharacteristic(global.Characteristic.On)
          .updateValue(this.activeMode === 1);
        return;
      }

      super.updateStateFromProp(prop, value);
    }
  };

module.exports = MoonlightMode;
