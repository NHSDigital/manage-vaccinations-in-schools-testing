/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.755016393442623, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "5.0 Consent for menacwy"], "isController": true}, {"data": [0.07807807807807808, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9546511627906977, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [1.0, 500, 1500, "Choose session"], "isController": false}, {"data": [0.9405940594059405, 500, 1500, "2.5 Select menacwy"], "isController": false}, {"data": [0.9574574574574575, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.9306930693069307, 500, 1500, "2.5 Select td_ipv"], "isController": false}, {"data": [0.09523809523809523, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.09161490683229814, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.25, 500, 1500, "5.8 Consent confirm"], "isController": false}, {"data": [1.0, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [1.0, 500, 1500, "Get correct patient name"], "isController": false}, {"data": [1.0, 500, 1500, "5.9 Patient home page"], "isController": false}, {"data": [0.4783878504672897, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "6.1 Logout"], "isController": false}, {"data": [1.0, 500, 1500, "Logout"], "isController": false}, {"data": [1.0, 500, 1500, "5.4 Consent route"], "isController": false}, {"data": [1.0, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.5, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.034653465346534656, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.7302302302302303, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.4190207156308851, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [1.0, 500, 1500, "5.6 Consent questions"], "isController": false}, {"data": [0.8578154425612052, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "5.3 Consent parent details"], "isController": false}, {"data": [1.0, 500, 1500, "Homepage"], "isController": true}, {"data": [1.0, 500, 1500, "Sign In Page"], "isController": true}, {"data": [1.0, 500, 1500, "5.2 Consent who"], "isController": false}, {"data": [0.4857142857142857, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.08415841584158416, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.0, 500, 1500, "5.0 Consent for td_ipv"], "isController": true}, {"data": [1.0, 500, 1500, "Login"], "isController": true}, {"data": [1.0, 500, 1500, "Calculate slug from API"], "isController": true}, {"data": [1.0, 500, 1500, "Search for school session"], "isController": false}, {"data": [0.9627329192546584, 500, 1500, "2.5 Select hpv"], "isController": false}, {"data": [0.9523809523809523, 500, 1500, "2.5 Select flu"], "isController": false}, {"data": [0.75, 500, 1500, "5.1 Consent start"], "isController": false}, {"data": [0.75, 500, 1500, "5.5 Consent agree"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.9928571428571429, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.9317325800376648, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.75, 500, 1500, "5.7 Consent triage"], "isController": false}, {"data": [0.92992992992993, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [1.0, 500, 1500, "Calculate slug"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 13113, 0, 0.0, 382.985968123237, 0, 17009, 228.0, 816.0, 1132.2999999999993, 2762.560000000027, 4.511531188845065, 74.46948200995544, 3.95617155976394], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["5.0 Consent for menacwy", 1, 0, 0.0, 3914.0, 3914, 3914, 3914.0, 3914.0, 3914.0, 3914.0, 0.2554931016862545, 50.53299254279509, 3.993327238758303], "isController": true}, {"data": ["2.0 Register attendance", 999, 0, 0.0, 2217.575575575572, 544, 13827, 1918.0, 3314.0, 4307.0, 8166.0, 0.3805161993630639, 51.073640597307595, 1.5134224506366887], "isController": true}, {"data": ["2.5 Select patient", 860, 0, 0.0, 314.24302325581385, 150, 8938, 185.0, 462.69999999999993, 654.1999999999989, 2821.2099999999955, 0.3285036924197009, 7.556390666904513, 0.22839332616100272], "isController": false}, {"data": ["Choose session", 999, 0, 0.0, 0.17217217217217215, 0, 43, 0.0, 1.0, 1.0, 1.0, 0.38087119233652084, 0.0, 0.0], "isController": false}, {"data": ["2.5 Select menacwy", 202, 0, 0.0, 344.29207920792084, 152, 4480, 204.0, 525.2000000000005, 675.9999999999999, 1868.0099999999993, 0.0775483362234805, 1.8216428396684308, 0.05816125216761036], "isController": false}, {"data": ["2.3 Search by first/last name", 999, 0, 0.0, 305.30630630630543, 153, 8357, 200.0, 476.0, 583.0, 2310.0, 0.38107153960149603, 10.849623139343825, 0.297875673383736], "isController": false}, {"data": ["2.5 Select td_ipv", 202, 0, 0.0, 356.20792079207916, 156, 4768, 208.0, 515.2000000000003, 580.85, 2576.95, 0.07741376700372314, 1.9038922124672573, 0.05397795863345539], "isController": false}, {"data": ["4.0 Vaccination for flu", 336, 0, 0.0, 2195.5446428571454, 1362, 15762, 1761.0, 3010.4000000000005, 4201.799999999997, 11761.209999999995, 0.12813731438680764, 5.843643484069786, 0.7734866210914783], "isController": true}, {"data": ["4.0 Vaccination for hpv", 322, 0, 0.0, 2376.795031055899, 1375, 17730, 1807.5, 3653.2999999999993, 6237.999999999993, 11829.029999999992, 0.12347875705209421, 5.3711218365039635, 0.7482177248291239], "isController": true}, {"data": ["5.8 Consent confirm", 2, 0, 0.0, 5343.0, 907, 9779, 5343.0, 9779.0, 9779.0, 9779.0, 0.009612981370042106, 0.7828149257757676, 0.021145742710956875], "isController": false}, {"data": ["1.2 Sign-in page", 70, 0, 0.0, 108.11428571428567, 100, 398, 102.0, 105.9, 125.20000000000005, 398.0, 0.07889795338708913, 0.46768611040979596, 0.04753909886702539], "isController": false}, {"data": ["Get correct patient name", 990, 0, 0.0, 0.30000000000000077, 0, 46, 0.0, 1.0, 1.0, 1.0, 0.37771424886943256, 0.0, 0.0], "isController": false}, {"data": ["5.9 Patient home page", 2, 0, 0.0, 325.5, 211, 440, 325.5, 440.0, 440.0, 440.0, 0.009483167377904219, 0.23981578206495968, 0.0071077450806069226], "isController": false}, {"data": ["2.4 Patient attending session", 856, 0, 0.0, 797.9264018691591, 480, 6618, 612.5, 1192.9000000000024, 1648.4499999999998, 3823.7299999999996, 0.32669374102880283, 9.727891810296464, 0.486212169265523], "isController": false}, {"data": ["6.1 Logout", 2, 0, 0.0, 118.0, 114, 122, 118.0, 122.0, 122.0, 122.0, 0.0943975079057913, 0.4480194222872516, 0.06923098480200122], "isController": false}, {"data": ["Logout", 1, 0, 0.0, 151.0, 151, 151, 151.0, 151.0, 151.0, 151.0, 6.622516556291391, 31.52162665562914, 4.837541390728477], "isController": false}, {"data": ["5.4 Consent route", 2, 0, 0.0, 286.0, 267, 305, 286.0, 305.0, 305.0, 305.0, 0.010320929296473855, 0.11058714476651478, 0.01632299315980411], "isController": false}, {"data": ["1.1 Homepage", 70, 0, 0.0, 304.0285714285715, 293, 338, 301.5, 313.0, 327.45, 338.0, 0.07888337206131267, 0.43539923719779217, 0.04275417138088724], "isController": false}, {"data": ["1.3 Sign-in", 70, 0, 0.0, 572.9571428571429, 548, 682, 567.0, 593.0, 624.1, 682.0, 0.07814314037187205, 1.1584110066845874, 0.17284591107645525], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 202, 0, 0.0, 2110.9504950495043, 1419, 12198, 1834.5, 3039.3, 3465.8999999999996, 10395.929999999995, 0.0773293060843234, 3.7364506231325643, 0.4696197902011902], "isController": true}, {"data": ["2.1 Open session", 999, 0, 0.0, 603.3963963963954, 173, 9233, 501.0, 970.0, 1308.0, 3075.0, 0.3808544941402162, 6.141638732611362, 0.25004223972750794], "isController": false}, {"data": ["4.3 Vaccination confirm", 1062, 0, 0.0, 1239.2664783427513, 635, 17009, 982.0, 1899.4, 2495.349999999999, 6764.349999999939, 0.39122448844266866, 7.911178877128618, 0.9108540482156553], "isController": false}, {"data": ["5.6 Consent questions", 2, 0, 0.0, 259.5, 255, 264, 259.5, 264.0, 264.0, 264.0, 0.01014800870699147, 0.11641470535256719, 0.025265965037573], "isController": false}, {"data": ["4.1 Vaccination questions", 1062, 0, 0.0, 564.2561205273062, 259, 11294, 472.0, 670.2000000000003, 972.7999999999993, 4228.469999999931, 0.3920543648719289, 4.463536103218648, 0.8270733150891463], "isController": false}, {"data": ["5.3 Consent parent details", 2, 0, 0.0, 371.0, 263, 479, 371.0, 479.0, 479.0, 479.0, 0.01016043324087339, 0.108133204549842, 0.018678726148382965], "isController": false}, {"data": ["Homepage", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["Sign In Page", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["5.2 Consent who", 2, 0, 0.0, 292.5, 288, 297, 292.5, 297.0, 297.0, 297.0, 0.010215756783262505, 0.14622798344792007, 0.016166634636012586], "isController": false}, {"data": ["1.0 Login", 70, 0, 0.0, 1275.5857142857144, 1217, 2051, 1254.5, 1326.0, 1369.3500000000001, 2051.0, 0.07879750504585452, 3.8739285122299356, 0.311573337822915], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 202, 0, 0.0, 2059.381188118812, 1358, 6435, 1804.5, 3032.400000000001, 3576.65, 5967.66, 0.07748447050104834, 3.6631235941555227, 0.46981665512870474], "isController": true}, {"data": ["5.0 Consent for td_ipv", 1, 0, 0.0, 12609.0, 12609, 12609, 12609.0, 12609.0, 12609.0, 12609.0, 0.07930843048616068, 15.774710152470458, 1.2721877726227298], "isController": true}, {"data": ["Login", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["Calculate slug from API", 1, 0, 0.0, 416.0, 416, 416, 416.0, 416.0, 416.0, 416.0, 2.403846153846154, 62.43896484375, 1.5657865084134617], "isController": true}, {"data": ["Search for school session", 1, 0, 0.0, 284.0, 284, 284, 284.0, 284.0, 284.0, 284.0, 3.5211267605633805, 62.71319322183099, 2.293546434859155], "isController": false}, {"data": ["2.5 Select hpv", 322, 0, 0.0, 322.22360248447194, 150, 9061, 184.0, 457.09999999999997, 529.55, 4770.689999999999, 0.12354726450241531, 2.7798910130635885, 0.09217784187484893], "isController": false}, {"data": ["2.5 Select flu", 336, 0, 0.0, 324.80357142857133, 152, 8040, 186.0, 475.0, 724.15, 3084.0699999999965, 0.12826184961985249, 2.9743724754412915, 0.09569536436481181], "isController": false}, {"data": ["5.1 Consent start", 2, 0, 0.0, 534.0, 401, 667, 534.0, 667.0, 667.0, 667.0, 0.01003461943705785, 0.11956288256986604, 0.021637148161155986], "isController": false}, {"data": ["5.5 Consent agree", 2, 0, 0.0, 414.5, 287, 542, 414.5, 542.0, 542.0, 542.0, 0.010192017611806433, 0.17075113099545436, 0.015930004089547065], "isController": false}, {"data": ["Debug Sampler", 1860, 0, 0.0, 0.5096774193548388, 0, 10, 0.0, 1.0, 1.0, 1.0, 0.685339843816208, 5.334639372838508, 0.0], "isController": false}, {"data": ["1.5 Open Sessions list", 70, 0, 0.0, 290.48571428571427, 264, 1076, 276.0, 295.6, 307.45, 1076.0, 0.07798183023355558, 1.7851289868210707, 0.046606328225523456], "isController": false}, {"data": ["4.2 Vaccination batch", 1062, 0, 0.0, 404.9877589453855, 257, 7315, 294.0, 538.1000000000001, 790.2499999999977, 2647.729999999975, 0.39177002583026105, 5.5605713159553325, 0.6337594043712239], "isController": false}, {"data": ["5.7 Consent triage", 2, 0, 0.0, 435.5, 315, 556, 435.5, 556.0, 556.0, 556.0, 0.010021194827059229, 0.15845035687980077, 0.01678354407070955], "isController": false}, {"data": ["2.2 Session register", 999, 0, 0.0, 353.52152152152195, 155, 5994, 236.0, 530.0, 728.0, 1938.0, 0.3807301023740942, 13.296120185422039, 0.2533068335193791], "isController": false}, {"data": ["Calculate slug", 1, 0, 0.0, 128.0, 128, 128, 128.0, 128.0, 128.0, 128.0, 7.8125, 0.0, 0.0], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 13113, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
