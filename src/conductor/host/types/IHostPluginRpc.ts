export interface IHostPluginRpc {
    $requestLoadPlugin(pluginName: string): void;
    queryPluginResolutions(pluginName: string): Record<string, string>;
}
