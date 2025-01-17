import { AppNotificationType } from "src/app/models/notification";
import { ApplicationService } from "src/app/services/application.service";
import { SocketIn } from "./socketIn";

export class SocketInOnAudioLibraryCleanFinished extends SocketIn {

    static method:string = "AudioLibrary.OnCleanFinished";

    constructor(private application: ApplicationService){
        super()
    }

    handle(data: any){
        this.application.showNotification("library.audioLibrary", "notification.cleanFinished", AppNotificationType.success)
    }

}