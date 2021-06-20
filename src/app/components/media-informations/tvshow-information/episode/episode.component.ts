import { Component, Input, OnInit } from '@angular/core';
import { ClipboardService } from 'ngx-clipboard';
import { heightAnimation, openCloseAnimation } from 'src/app/models/appAnimation';
import { ListItemFile } from 'src/app/models/kodiInterfaces/listItem';
import { PlaylistItem } from 'src/app/models/kodiInterfaces/playlist';
import { VideoDetailsEpisode, VideoDetailsSeason } from 'src/app/models/kodiInterfaces/video';
import { AppNotificationType } from 'src/app/models/notification';
import { ApplicationService } from 'src/app/services/application.service';
import { KodiApiService } from 'src/app/services/kodi-api.service';
import { PlayerService } from 'src/app/services/player.service';

@Component({
  selector: 'app-episode',
  templateUrl: './episode.component.html',
  styleUrls: ['./episode.component.scss'],
  animations: [
    heightAnimation,
    openCloseAnimation
  ]
})
export class EpisodeComponent implements OnInit {

  @Input() episode!:VideoDetailsEpisode;

  imgUrl: string = "";
  downloadUrl: string = "";
  moreInfo = false;

  fileDetails!:ListItemFile;

  constructor(private kodiApi:KodiApiService, private player: PlayerService, private application: ApplicationService, private clipboardApi: ClipboardService) { }

  ngOnInit(): void {
    if(this.episode.art && this.episode.art.thumb)
    this.kodiApi.file.getPreparedFileUrl(this.episode.art.thumb).subscribe((resp) => {
      this.imgUrl = resp;
    });

    if(this.episode.file)
    this.kodiApi.file.getPreparedFileUrl(this.episode.file).subscribe((resp) => {
      this.downloadUrl = resp;
    });
  }

  toogleMoreInfo() : void {

    if(!this.fileDetails && !this.moreInfo){
      if(this.episode.file)
      this.kodiApi.file.getFileDetails(this.episode.file, "video").subscribe((resp) => {
        this.fileDetails = resp.filedetails;
        this.moreInfo = true;
      });
    } else {
      this.moreInfo = !this.moreInfo;
    }
    
  }

  getSize(value: number) : number {
    return Number((value/Math.pow(10, 9)).toFixed(2));
  }

  async playEpisode(event: any){
    if(event.target.classList.contains('no-play')) return;

    this.kodiApi.playlist.clear(1)
    let items: PlaylistItem[] = [];

    if(this.episode.tvshowid && this.episode.season)
    this.kodiApi.media.getEpisodes(this.episode.tvshowid, this.episode.season).subscribe(resp => {
      const episodes: VideoDetailsEpisode[] = resp.episodes

      episodes.filter(ep => ep.episode ?? 0 >= (this.episode.episode ?? 0)).forEach(ep => {
        const item: PlaylistItem = {
          episodeid: ep.episodeid
        }
        items.push(item);
      });

      this.playListEpisodes(items);
    });
  }

  async playListEpisodes(items: PlaylistItem[]){
      await this.kodiApi.playlist.add(1, items);
      // this.player.openPlaylist(1);
  }

  setWatched(watched: boolean){
    let params: Map<string, any> = new Map<string, any>();   
    if(watched){
      params.set("playcount", 1);
      this.episode.playcount = 1;
    } else {
      params.set("playcount", 0);
      this.episode.playcount = 0;
    }
  
    this.kodiApi.media.setEpisodeDetails(this.episode.episodeid, params).subscribe()
    
  }

  streamLink(){
    this.clipboardApi.copyFromContent(this.downloadUrl);
    this.application.showNotification('library.musicsView.linkCopied', "library.musicsView.linkWasCopiedInClipBoard", AppNotificationType.success);
  }

}