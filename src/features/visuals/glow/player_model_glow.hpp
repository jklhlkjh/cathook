/*
/^-----^\   data: 2026-05-06
V  o o  V  file: src/features/visuals/glow/player_model_glow.hpp
 |  Y  |   author: pupnoodle
  \ Q /
  / - \
  |    \
  |     \     )
  || (___\====
*/

#ifndef PLAYER_MODEL_GLOW_HPP
#define PLAYER_MODEL_GLOW_HPP

class Entity;

namespace player_model_glow
{

void store();
void note_rendered_model(Entity* entity);
void render_first();
void render_second();
void shutdown();

[[nodiscard]] bool is_rendering();

} // namespace player_model_glow

#endif
