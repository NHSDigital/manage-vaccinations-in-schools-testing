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

    var data = {"OkPercent": 99.88122773019941, "KoPercent": 0.11877226980058761};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.6523414048429057, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9736842105263158, 500, 1500, "7.3 Safe to vaccinate"], "isController": false}, {"data": [0.052163833075734155, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9238794435857806, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.0, 500, 1500, "7.1 Full name search"], "isController": false}, {"data": [0.9455177743431221, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.19195046439628483, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.17080745341614906, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.0, 500, 1500, "7.6 First name search"], "isController": false}, {"data": [0.8822254335260116, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.4286287089013633, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.888728323699422, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.8666907514450867, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.18615384615384614, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.5780525502318392, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.0, 500, 1500, "7.7 Partial name search"], "isController": false}, {"data": [0.3500772797527048, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.8999227202472952, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.0, 500, 1500, "7.7 Last name search"], "isController": false}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.27890173410404623, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.2191358024691358, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.025, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.05263157894736842, 500, 1500, "7.5 year group"], "isController": false}, {"data": [0.0, 500, 1500, "7.2 No Consent search"], "isController": false}, {"data": [0.6928152492668622, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.901468315301391, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.9412673879443586, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.7368421052631579, 500, 1500, "7.3 Due vaccination"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 15997, 19, 0.11877226980058761, 669.433643808214, 1, 19006, 308.0, 1414.0, 2274.2999999999956, 6623.080000000002, 4.374994188371163, 1842.9565593606949, 21.171687201060067], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["7.3 Safe to vaccinate", 19, 0, 0.0, 187.578947368421, 103, 569, 156.0, 372.0, 569.0, 569.0, 0.005610500731284477, 2.383076622626943, 0.024574489197128485], "isController": false}, {"data": ["2.0 Register attendance", 1294, 18, 1.3910355486862442, 2919.9744976816055, 565, 16031, 2319.5, 5092.5, 6581.5, 10812.199999999988, 0.42005281498686114, 878.016795163793, 9.131866270371669], "isController": true}, {"data": ["2.5 Select patient", 1294, 0, 0.0, 295.43122102009335, 78, 6585, 136.0, 579.5, 1046.5, 2594.7999999999865, 0.42033157469720855, 175.1321427285155, 1.7485444694523866], "isController": false}, {"data": ["7.1 Full name search", 19, 0, 0.0, 9726.368421052632, 7747, 12394, 9541.0, 11781.0, 12394.0, 12394.0, 0.005589302193271598, 2.7797306819559084, 0.02426244377235537], "isController": false}, {"data": ["2.3 Search by first/last name", 1294, 0, 0.0, 233.8786707882533, 73, 5510, 131.5, 491.5, 748.5, 1769.4499999999996, 0.4203282978393047, 177.68992042022435, 1.8173450302309924], "isController": false}, {"data": ["4.0 Vaccination for flu", 323, 0, 0.0, 2255.1919504643943, 822, 18423, 1717.0, 3690.2000000000003, 5083.400000000001, 14517.399999999987, 0.1106101123668612, 135.49982122437262, 1.872683926873874], "isController": true}, {"data": ["4.0 Vaccination for hpv", 322, 0, 0.0, 2416.94099378882, 814, 27174, 1799.5, 4064.0999999999985, 5670.7999999999965, 15981.769999999957, 0.10952388402985308, 133.93940772079182, 1.8568531445429555], "isController": true}, {"data": ["7.6 First name search", 19, 0, 0.0, 7305.631578947368, 6395, 9723, 7115.0, 8901.0, 9723.0, 9723.0, 0.005601666112396546, 2.7536133372205946, 0.024262849761398506], "isController": false}, {"data": ["1.2 Sign-in page", 1384, 0, 0.0, 477.9161849710989, 14, 10894, 187.0, 911.0, 1590.25, 6874.050000000023, 0.3886511614323256, 160.66197620287394, 1.9277856252565968], "isController": false}, {"data": ["2.4 Patient attending session", 1247, 18, 1.4434643143544508, 1155.8644747393732, 76, 13826, 813.0, 2087.2000000000007, 2993.3999999999987, 5600.759999999998, 0.40506713979721304, 171.60957597284735, 2.0635540511058625], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 20.0, 20, 20, 20.0, 20.0, 20.0, 20.0, 50.0, 15.625, 29.4921875], "isController": false}, {"data": ["1.1 Homepage", 1384, 1, 0.07225433526011561, 453.73988439306373, 31, 9365, 199.0, 756.5, 1581.0, 6675.400000000012, 0.3894962102919308, 160.78895295638952, 1.9237421685651792], "isController": false}, {"data": ["1.3 Sign-in", 1384, 0, 0.0, 506.6322254335255, 94, 11066, 212.0, 910.5, 1811.0, 6613.800000000008, 0.387939129435442, 160.55373667116203, 2.025536749278921], "isController": false}, {"data": ["Run some searches", 19, 0, 0.0, 38309.94736842105, 31808, 55386, 37086.0, 43519.0, 55386.0, 55386.0, 0.005567271243022231, 22.087871094339462, 0.19421524165766382], "isController": true}, {"data": ["4.0 Vaccination for td_ipv", 325, 0, 0.0, 2326.9999999999986, 805, 19284, 1755.0, 4348.600000000001, 5764.0, 11536.320000000009, 0.10684378846376386, 131.38221803246176, 1.8120549211385997], "isController": true}, {"data": ["2.1 Open session", 1294, 0, 0.0, 1030.2449768160748, 245, 9512, 664.5, 2075.0, 3144.5, 5473.299999999994, 0.4201825293689404, 174.42436703309247, 1.7517725283509558], "isController": false}, {"data": ["7.7 Partial name search", 19, 0, 0.0, 7805.894736842105, 5902, 12665, 7133.0, 9612.0, 12665.0, 12665.0, 0.005600124028010052, 2.7427329893837857, 0.024250701562906193], "isController": false}, {"data": ["4.3 Vaccination confirm", 1294, 0, 0.0, 1560.2217928902628, 558, 19006, 1078.5, 2760.0, 4104.0, 9871.19999999999, 0.42129732879912357, 174.37434267676417, 2.542395218466595], "isController": false}, {"data": ["4.1 Vaccination questions", 1294, 0, 0.0, 376.9961360123647, 100, 15142, 202.0, 721.5, 1099.0, 2913.999999999971, 0.42102084866610573, 170.40916649564727, 2.4055768246934583], "isController": false}, {"data": ["7.7 Last name search", 19, 0, 0.0, 7388.473684210527, 6119, 9318, 7175.0, 9091.0, 9318.0, 9318.0, 0.005601107958113145, 2.785630550071547, 0.02427453860136207], "isController": false}, {"data": ["Reset counters", 1, 0, 0.0, 14.0, 14, 14, 14.0, 14.0, 14.0, 14.0, 71.42857142857143, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 1384, 1, 0.07225433526011561, 2244.0859826589617, 582, 25616, 1399.0, 3732.0, 5795.0, 20258.60000000006, 0.3879402168428842, 662.1664600376378, 7.45578626393109], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 324, 0, 0.0, 2162.3148148148134, 847, 14823, 1591.0, 3614.5, 5457.75, 11083.75, 0.10600391102084056, 130.01624363219946, 1.7980554283899413], "isController": true}, {"data": ["7.0 Open Children Search", 20, 0, 0.0, 6657.5999999999985, 544, 9022, 6540.5, 8688.400000000001, 9007.25, 9022.0, 0.005599284411452216, 2.719305324342049, 0.02328487575537846], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 45.0, 45, 45, 45.0, 45.0, 45.0, 45.0, 22.22222222222222, 6.358506944444445, 13.715277777777779], "isController": false}, {"data": ["7.5 year group", 19, 0, 0.0, 2119.0526315789475, 1498, 4875, 1736.0, 3891.0, 4875.0, 4875.0, 0.005610666408379147, 2.872792701084069, 0.024712194037810574], "isController": false}, {"data": ["7.2 No Consent search", 19, 0, 0.0, 3105.0526315789475, 1748, 14312, 2114.0, 7149.0, 14312.0, 14312.0, 0.005598398033135444, 3.063067261363864, 0.02461988764972768], "isController": false}, {"data": ["1.4 Open Sessions list", 1364, 0, 0.0, 817.6129032258071, 283, 12563, 501.0, 1601.0, 2502.5, 4841.499999999997, 0.4236797204956307, 200.68144385909793, 1.7618622119544773], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 1.0, 1, 1, 1.0, 1.0, 1.0, 1.0, 1000.0, 285.15625, 614.2578125], "isController": false}, {"data": ["4.2 Vaccination batch", 1294, 0, 0.0, 353.00386398763527, 91, 7490, 193.0, 714.5, 1083.5, 2601.999999999998, 0.4211621275652565, 171.57785867913353, 2.191413864289455], "isController": false}, {"data": ["2.2 Session register", 1294, 0, 0.0, 246.53786707882543, 72, 6902, 129.0, 508.5, 791.25, 1611.1999999999998, 0.4203083647211218, 179.67140429736475, 1.755991261873549], "isController": false}, {"data": ["7.3 Due vaccination", 19, 0, 0.0, 671.8947368421052, 365, 1944, 487.0, 1160.0, 1944.0, 1944.0, 0.005609069688557882, 2.8468355210980727, 0.02449153460382698], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 18, 94.73684210526316, 0.11252109770581985], "isController": false}, {"data": ["Assertion failed", 1, 5.2631578947368425, 0.006251172094767769], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 15997, 19, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 18, "Assertion failed", 1, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 1247, 18, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 18, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["1.1 Homepage", 1384, 1, "Assertion failed", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
