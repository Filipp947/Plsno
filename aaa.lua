-- hub name
getgenv().namehub = "Light Hub"

local http = game:GetService("HttpService")
local mps = game:GetService("MarketplaceService")
local player = game:GetService("Players").LocalPlayer

-- get main place id from universe
local universeId = game.GameId
local main_place_id
do
    local url = ("https://games.roblox.com/v1/games?universeIds=%d"):format(universeId)
    local success, body = pcall(function()
        return game:HttpGet(url)
    end)

    if success then
        local data = http:JSONDecode(body)
        if data.data and data.data[1] and data.data[1].rootPlaceId then
            main_place_id = tonumber(data.data[1].rootPlaceId)
            print("Main Place ID:", main_place_id)
        else
            warn("Main place ID not found, using current place ID")
            main_place_id = game.PlaceId
        end
    else
        warn("Failed to fetch main place ID:", body)
        main_place_id = game.PlaceId
    end
end

local product_info = mps:GetProductInfo(main_place_id)
local place_name = product_info.Name

-- load UI
local ui = loadstring(game:HttpGet("https://raw.githubusercontent.com/wzaxk/check/refs/heads/main/uiloader"))()

local function launchMainUI()
    local main = ui.new()

    -- icons
    local icons = {
        main = 7733960981,
        verified = 7734056411,
        non_verified = 7733658271,
        coming_soon = 7733734848
    }

    -- main tab with titles
    local main_tab = main:create_tab('Main', icons.main)
    main_tab.create_title({ name = "Welcome to Light Hub!", section = 'left' })
    main_tab.create_title({ name = "Head Developer - filipp999 (discord)", section = 'left' })
    main_tab.create_title({ name = "600+ supported games 1500+ scripts", section = 'left' })
    main_tab.create_title({ name = "We are working on Grow a garden, Dead Rails, etc..", section = 'left' })
    main_tab.create_title({ name = "Please be patient as we fix some issues.", section = 'left' })
    main_tab.create_button({
        name = "Join Our Discord",
        flag = "join_discord",
        section = "left",
        enabled = false,
        callback = function()
            setclipboard("https://discord.gg/Z5TBEsec5W")
        end
    })

    -- ScriptBlox tab
    local tab = main:create_tab(place_name, icons.verified)
    tab.create_title({ name = "Loading scripts from the database...", section = "left" })

    local added_ids = {}
    local total_pages = 1961
    local batch_size = 10

    task.spawn(function()
        for batch_start = 1, total_pages, batch_size do
            local batch_end = math.min(batch_start + batch_size - 1, total_pages)

            for page = batch_start, batch_end do
                local url = "https://scriptblox.com/api/script/fetch?page="..page.."&max=20&mode=free&patched=0&universal=0"
                local success, response = pcall(function()
                    return game:HttpGet(url)
                end)

                if success then
                    local data = http:JSONDecode(response)
                    if data and data.result and data.result.scripts then
                        for _, script_data in ipairs(data.result.scripts) do
                            if script_data.game and script_data.game.gameId and tonumber(script_data.game.gameId) == main_place_id then
                                if not added_ids[script_data._id] then
                                    added_ids[script_data._id] = true

                                    tab.create_button({
                                        name = script_data.title,
                                        flag = "scriptblox_button_"..script_data._id,
                                        section = "left",
                                        callback = function()
                                            local ok, err = pcall(function()
                                                loadstring(script_data.script)()
                                            end)
                                            if not ok then warn("Failed to run script: "..err) end
                                        end
                                    })
                                end
                            end
                        end
                    end
                else
                    warn("Failed to fetch page: "..page)
                end
                task.wait(0.15)
            end
            task.wait(1.5)
        end
    end)
end

-- always launch main UI (no key system)
print("✅ Launching Light Hub (keyless)...")
launchMainUI()
