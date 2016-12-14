INSERT INTO cards (
    id, 
    cost, 
    deck_limit, 
    faction, 
    side, 
    flavor, 
    img_src, 
    subtypes, 
    text_box, 
    type, 
    is_unique, 
    cycle, 
    min_deck_size, 
    influence
) VALUES (
    $1,
    $2,
    $3,
    $4,
    $5,
    $6,
    $7,
    $8,
    $9,
    $10,
    $11,
    $12,
    $13,
    $14
);