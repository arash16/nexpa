function jhms(j) {
    j += 0.5;
    var ij = (j - floor(j)) * 86400.0 + 0.5;
    return [floor(ij / 3600),
            floor((ij / 60) % 60),
            floor(ij % 60)];
}
