// Isometric projection helpers. The world is stored in tile coordinates
// (col, row). Movement and collision are computed in tile space; the
// projection only matters at render time.
//
// Classic 2:1 isometric tiles: width = 64, height = 32. A tile at
// (col, row) projects to screen (logical) coordinates:
//   sx = (col - row) * (TILE_W / 2)
//   sy = (col + row) * (TILE_H / 2)
// Then we offset by the camera + a world-center offset.

export const TILE_W = 64
export const TILE_H = 32
export const HALF_W = TILE_W / 2
export const HALF_H = TILE_H / 2

export const WORLD_W = 32 // tiles
export const WORLD_H = 22

// World iso bounds for camera clamp + sky/cloud sizing.
export const WORLD_ISO_W = (WORLD_W + WORLD_H) * HALF_W
export const WORLD_ISO_H = (WORLD_W + WORLD_H) * HALF_H

// World origin offset: shift so that tile (0,0) appears at world iso x =
// row * HALF_W (i.e. world's left edge sits at iso x = 0).
export const WORLD_OFFSET_X = WORLD_H * HALF_W

export function isoProject(col, row) {
  return {
    x: (col - row) * HALF_W + WORLD_OFFSET_X,
    y: (col + row) * HALF_H,
  }
}

// Project a single tile center (the visual midpoint of the diamond).
export function isoTileCenter(col, row) {
  return {
    x: (col - row) * HALF_W + WORLD_OFFSET_X + HALF_W,
    y: (col + row) * HALF_H + HALF_H,
  }
}

// Inverse projection: given a screen point in world iso space, return
// the fractional (col, row). Useful for click-to-move if we ever add it.
export function isoUnproject(sx, sy) {
  const x = sx - WORLD_OFFSET_X
  return {
    col: (x / HALF_W + sy / HALF_H) / 2,
    row: (sy / HALF_H - x / HALF_W) / 2,
  }
}

// Compute the four diamond corners for a floor tile.
export function tileDiamond(col, row) {
  const { x, y } = isoProject(col, row)
  return {
    top: { x: x + HALF_W, y },
    right: { x: x + TILE_W, y: y + HALF_H },
    bottom: { x: x + HALF_W, y: y + TILE_H },
    left: { x, y: y + HALF_H },
  }
}

// Helper to draw an extruded "box": a top diamond plus two visible side
// faces. Used for walls and station bases. The diamond corners are taken
// from the box's top-edge tile at (col, row) of size (sizeCol, sizeRow);
// the box rises by `height` pixels.
export function drawExtrudedBox(ctx, col, row, sizeCol, sizeRow, height, colors) {
  // Compute the four ground corners of the footprint.
  const topCorner = isoProject(col, row)
  const rightCorner = isoProject(col + sizeCol, row)
  const bottomCorner = isoProject(col + sizeCol, row + sizeRow)
  const leftCorner = isoProject(col, row + sizeRow)
  // The "top" of the diamond is the further-back corner.
  const top = { x: topCorner.x + HALF_W, y: topCorner.y }
  const right = { x: rightCorner.x + TILE_W, y: rightCorner.y + HALF_H }
  const bottom = { x: bottomCorner.x + HALF_W, y: bottomCorner.y + TILE_H }
  const left = { x: leftCorner.x, y: leftCorner.y + HALF_H }

  // Bottom corners are the same as the ground corners.
  // Top corners are ground corners lifted by `height`.
  const topU = { x: top.x, y: top.y - height }
  const rightU = { x: right.x, y: right.y - height }
  const bottomU = { x: bottom.x, y: bottom.y - height }
  const leftU = { x: left.x, y: left.y - height }

  // Right (south-east-facing) side: bottom corners (right, bottom) + their lifted versions.
  ctx.fillStyle = colors.rightFace
  ctx.beginPath()
  ctx.moveTo(right.x, right.y)
  ctx.lineTo(bottom.x, bottom.y)
  ctx.lineTo(bottomU.x, bottomU.y)
  ctx.lineTo(rightU.x, rightU.y)
  ctx.closePath()
  ctx.fill()

  // Left (south-west-facing) side: bottom + left.
  ctx.fillStyle = colors.leftFace
  ctx.beginPath()
  ctx.moveTo(left.x, left.y)
  ctx.lineTo(bottom.x, bottom.y)
  ctx.lineTo(bottomU.x, bottomU.y)
  ctx.lineTo(leftU.x, leftU.y)
  ctx.closePath()
  ctx.fill()

  // Top diamond.
  ctx.fillStyle = colors.top
  ctx.beginPath()
  ctx.moveTo(topU.x, topU.y)
  ctx.lineTo(rightU.x, rightU.y)
  ctx.lineTo(bottomU.x, bottomU.y)
  ctx.lineTo(leftU.x, leftU.y)
  ctx.closePath()
  ctx.fill()

  // Optional edge highlight.
  if (colors.edge) {
    ctx.strokeStyle = colors.edge
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(topU.x, topU.y)
    ctx.lineTo(rightU.x, rightU.y)
    ctx.lineTo(bottomU.x, bottomU.y)
    ctx.lineTo(leftU.x, leftU.y)
    ctx.closePath()
    ctx.stroke()
  }

  return { top: topU, right: rightU, bottom: bottomU, left: leftU, ground: { top, right, bottom, left } }
}
