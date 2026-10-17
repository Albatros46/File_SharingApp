package com.backend.controller;

import com.backend.dto.FileDtos.PublicFileDto;
import com.backend.service.FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Endpoints anyone with a share link can call (no login). Only files marked public are served. */
@RestController
@RequestMapping("/api/public/files")
@RequiredArgsConstructor
public class PublicFileController {

    private final FileService fileService;

    @GetMapping("/{id}")
    public PublicFileDto info(@PathVariable String id) {
        return fileService.getPublic(id);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> download(@PathVariable String id) {
        return DownloadResponses.attachment(fileService.downloadPublic(id));
    }
}
